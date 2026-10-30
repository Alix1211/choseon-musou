package com.kane.choseonmusou;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.Intent;
import android.content.Context;
import android.net.ConnectivityManager;
import android.net.Network;
import android.net.NetworkCapabilities;
import android.content.SharedPreferences;
import android.net.Uri;
import android.os.Handler;
import android.os.Looper;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;

import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.Executors;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;

/**
 * Same SAF/baseT synchronization state machine as ARPG.
 * Phone/tablet localStorage remains the authoritative playable save.
 * Drive is the meeting point, never decided by whichever wall clock is later.
 * The on-device document provider, not Google account credentials, holds access.
 */
public final class SaveSyncManager {
    private static final int REQ_NEW = 4201, REQ_LINK = 4202;
    private static final int MAX_BYTES = 14 * 1024 * 1024;
    private static final int READ_WAIT_SECONDS = 15, WRITE_WAIT_SECONDS = 30;
    private final Activity activity;
    private final WebView game;
    private final SharedPreferences prefs;
    private final Handler ui = new Handler(Looper.getMainLooper());
    private final ScheduledExecutorService backupIO=Executors.newSingleThreadScheduledExecutor();
    private final ExecutorService documentIO=Executors.newSingleThreadExecutor();
    private final Object syncLock=new Object();
    private ScheduledFuture<?> pendingBackup;
    private volatile boolean pageReady, checkingRemote, documentBusy, sessionSynced;
    private volatile boolean writeDirty, conflictPending, restoringBackup, pickingBackup;
    private volatile String localText, pendingRemote;
    private boolean firstResume = true, alive = true;
    private final ConnectivityManager connectivity;
    private ConnectivityManager.NetworkCallback networkCallback;
    private volatile boolean networkValidated;

    public SaveSyncManager(Activity activity, WebView game) {
        this.activity=activity;this.game=game;
        // Keep the URI selected by the old v0.8 backup UI. baseT is unknown
        // until this app actually reads and reconciles the selected document.
        this.prefs=activity.getSharedPreferences("choseon_cloud",Activity.MODE_PRIVATE);
        this.localText=null;
        connectivity=(ConnectivityManager)activity.getSystemService(Context.CONNECTIVITY_SERVICE);
        networkValidated=isOnline();
        if(connectivity!=null){
            networkCallback=new ConnectivityManager.NetworkCallback(){
                @Override public void onCapabilitiesChanged(Network n,NetworkCapabilities caps){
                    boolean next=caps.hasCapability(NetworkCapabilities.NET_CAPABILITY_VALIDATED);
                    boolean old=networkValidated;networkValidated=next;
                    if(next&&!old&&pageReady&&!conflictPending)
                        js("window.ChoseonCloud&&window.ChoseonCloud.requestSync(true)");
                }
                @Override public void onLost(Network n){networkValidated=false;}
            };
            try{connectivity.registerDefaultNetworkCallback(networkCallback);}
            catch(Exception e){networkCallback=null;}
        }
    }
    private boolean isOnline(){
        if(connectivity==null)return false;
        try{
            NetworkCapabilities caps=connectivity.getNetworkCapabilities(connectivity.getActiveNetwork());
            return caps!=null&&caps.hasCapability(NetworkCapabilities.NET_CAPABILITY_VALIDATED);
        }catch(Exception e){return false;}
    }
    private Uri backupUri() {
        String uri=prefs.getString("uri","");
        return uri.isEmpty()?null:Uri.parse(uri);
    }
    private long baseT(){return prefs.getLong("baseT",-1L);}
    private void setBaseT(long t){prefs.edit().putLong("baseT",t).apply();}
    private void js(String script){
        ui.post(()->{if(alive)game.evaluateJavascript(script,null);});
    }
    private void notice(String text){
        js("window.ChoseonCloud&&window.ChoseonCloud.onNativeStatus("+
                JSONObject.quote(text)+")");
    }
    private void syncDone(){
        js("window.ChoseonCloud&&window.ChoseonCloud.onSyncDone()");
    }
    private void syncStart(){
        js("window.ChoseonCloud&&window.ChoseonCloud.onSyncStart()");
    }
    private void syncApplied(String text){
        js("window.ChoseonCloud&&window.ChoseonCloud.onApplied("+
                JSONObject.quote(text)+")");
    }

    @JavascriptInterface public boolean hasBackupFile(){return backupUri()!=null;}
    @JavascriptInterface public String backupStatus(){
        try{return new JSONObject()
            .put("linked",backupUri()!=null)
            .put("at",prefs.getLong("backupAt",0))
            .put("baseT",baseT())
            .put("syncing",checkingRemote)
            .put("conflict",conflictPending)
            .put("online",isOnline())
            .put("error",prefs.getString("error","")).toString();
        }catch(Exception e){return "{}";}
    }
    @JavascriptInterface public void webReady(String text){
        synchronized(syncLock){
            if(text!=null&&!text.isEmpty()&&!acceptLocal(text)){
                pageReady=false;
                notice("로컬 저장 검증에 실패했습니다. Drive 파일을 읽거나 쓰지 않습니다.");
                return;
            }
            pageReady=true;restoringBackup=false;
        }
        requestSync(true);
    }
    @JavascriptInterface public void saveLocal(String text){
        synchronized(syncLock){
            if(restoringBackup||conflictPending)return;
            if(!acceptLocal(text))return;
            if(checkingRemote){writeDirty=true;return;}
        }
        queueBackup(false);
    }
    @JavascriptInterface public void syncBackup(String text){
        synchronized(syncLock){if(!restoringBackup&&!conflictPending)acceptLocal(text);}
        requestSync(true);
    }
    @JavascriptInterface public void pickBackup(){
        ui.post(()->{
            if(conflictPending||checkingRemote||restoringBackup)return;
            new AlertDialog.Builder(activity)
                .setTitle("Google Drive 저장 동기화")
                .setItems(new String[]{"새 저장 파일 만들기","기존 저장 파일 연결"},
                   (dialog,choice)->pickDocument(choice==0))
                .setNegativeButton("취소",null).show();
        });
    }
    private void pickDocument(boolean create){
        pickingBackup=true;
        Intent intent=new Intent(create?Intent.ACTION_CREATE_DOCUMENT:Intent.ACTION_OPEN_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType(create?"application/json":"*/*");
        if(create)intent.putExtra(Intent.EXTRA_TITLE,"Choseon-Musou-Save.json");
        intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION|
            Intent.FLAG_GRANT_WRITE_URI_PERMISSION|Intent.FLAG_GRANT_PERSISTABLE_URI_PERMISSION);
        try{activity.startActivityForResult(intent,create?REQ_NEW:REQ_LINK);}
        catch(Exception e){pickingBackup=false;notice("파일 선택 창을 열 수 없습니다.");}
    }
    public void onActivityResult(int code,int result,Intent data){
        if(code!=REQ_NEW&&code!=REQ_LINK)return;
        pickingBackup=false;
        if(result!=Activity.RESULT_OK||data==null||data.getData()==null){
            notice("파일 선택을 취소했습니다.");return;
        }
        Uri uri=data.getData();
        try{
            int flags=data.getFlags() & (Intent.FLAG_GRANT_READ_URI_PERMISSION|Intent.FLAG_GRANT_WRITE_URI_PERMISSION);
            if(flags!=(Intent.FLAG_GRANT_READ_URI_PERMISSION|Intent.FLAG_GRANT_WRITE_URI_PERMISSION))
                throw new IllegalStateException("read-write grant missing");
            activity.getContentResolver().takePersistableUriPermission(uri,flags);
            synchronized(syncLock){
                prefs.edit().putString("uri",uri.toString()).putLong("baseT",-1)
                     .putLong("backupAt",0).remove("error").apply();
                sessionSynced=false;writeDirty=false;
            }
            notice("파일을 연결했습니다. 이 기기의 진행과 비교합니다.");
            requestSync(true);
        }catch(Exception e){notice("읽기·쓰기 권한을 보존할 수 없습니다. 다른 파일을 선택해 주세요.");}
    }

    private boolean acceptLocal(String text){
        if(text==null||text.isEmpty())return false;
        try{validBackup(text);localText=text;return true;}
        catch(Exception e){return false;}
    }

    /** Retain v0.8's existing JSON bundle; no reformat and no rewriting t. */
    static JSONObject validBackup(String text) throws Exception {
        if(text==null||text.getBytes(StandardCharsets.UTF_8).length>MAX_BYTES)
            throw new IllegalArgumentException("too large");
        JSONObject o=new JSONObject(text);
        if(!"choseon-musou-drive-backup".equals(o.optString("format"))||o.optInt("schema")!=1)
            throw new IllegalArgumentException("wrong format");
        if(!(o.opt("game") instanceof String))throw new IllegalArgumentException("missing game");
        JSONObject game=new JSONObject(o.getString("game"));
        if(!(game.opt("eq") instanceof JSONObject)||!(game.opt("cl") instanceof JSONObject)
                ||!(game.opt("lv") instanceof Number)||game.getInt("lv")<1||game.getInt("lv")>70
                ||!(game.opt("stage") instanceof Number)||game.getInt("stage")<1
                ||!Double.isFinite(game.getDouble("lv"))||game.getDouble("lv")!=game.getInt("lv"))
            throw new IllegalArgumentException("invalid progression");
        if(game.has("t")){
            Object tt=game.get("t");
            if(!(tt instanceof Number)||!Double.isFinite(game.getDouble("t"))||
              game.getDouble("t")<0||game.getDouble("t")>9007199254740991d||
              game.getDouble("t")!=game.getLong("t"))
                throw new IllegalArgumentException("invalid save time");
        }
        if(!o.isNull("audio")&&o.has("audio")&&!(o.get("audio") instanceof String))
            throw new IllegalArgumentException("invalid audio");
        if(!o.isNull("defaultCut")&&o.has("defaultCut")){
            Object cut=o.get("defaultCut");
            if(!(cut instanceof String)||!((String)cut).startsWith("data:image/")
                ||((String)cut).length()>13*1024*1024)throw new IllegalArgumentException("invalid image");
        }
        return o;
    }
    static long saveTime(JSONObject all){
        if(all==null)return -1;
        try{
            JSONObject valid=validBackup(all.toString());
            JSONObject game=new JSONObject(valid.getString("game"));
            return game.has("t")?game.getLong("t"):0;
        }catch(Exception e){return -1;}
    }
    static JSONObject parseRemote(String raw){
        try{
            if(raw==null||raw.trim().isEmpty())return null;
            JSONObject object=validBackup(raw);
            return saveTime(object)<0?null:object;
        }catch(Exception e){return null;}
    }
    static int decide(long lt,long rt,long bt){
        return SaveSyncDecider.decide(lt,rt,bt);
    }
    private String readDocument(Uri uri)throws Exception{
        try(InputStream in=activity.getContentResolver().openInputStream(uri);
            ByteArrayOutputStream out=new ByteArrayOutputStream()){
            if(in==null)throw new IllegalStateException("missing stream");
            byte[] buf=new byte[65536];int n;
            while((n=in.read(buf))!=-1){
                if(out.size()+n>MAX_BYTES)throw new IllegalArgumentException("too large");
                out.write(buf,0,n);
            }
            return out.toString("UTF-8");
        }
    }
    // Read may be interrupted after 15s. A failed read never triggers a write.
    private String readDocumentTimed(Uri uri)throws Exception{
        documentBusy=true;
        Future<String> task=documentIO.submit(()->{
            try{return readDocument(uri);}
            finally{documentBusy=false;}
        });
        try{return task.get(READ_WAIT_SECONDS,TimeUnit.SECONDS);}
        finally{task.cancel(true);}
    }
    // CRITICAL: writes are never cancelled, even after a 30s UI wait.
    private void writeDocument(Uri uri,String text)throws Exception{
        documentBusy=true;
        Future<?> task=documentIO.submit(()->{
            try(OutputStream out=activity.getContentResolver().openOutputStream(uri,"wt")){
                if(out==null)throw new IllegalStateException("cannot write");
                out.write(text.getBytes(StandardCharsets.UTF_8));
                out.flush();
            }catch(Exception e){throw new IllegalStateException(e);}
            finally{documentBusy=false;}
        });
        task.get(WRITE_WAIT_SECONDS,TimeUnit.SECONDS); // intentionally NO cancel()
    }

    private void queueBackup(boolean force){
        synchronized(syncLock){
            if(backupUri()==null||pickingBackup||restoringBackup||conflictPending)return;
            if(checkingRemote||documentBusy){writeDirty=true;return;}
            if(pendingBackup!=null&&!pendingBackup.isDone()){
                if(!force)return;
                pendingBackup.cancel(false);
            }
            pendingBackup=backupIO.schedule(()->{
                synchronized(syncLock){pendingBackup=null;}
                writeBackup();
            },force?0:5,TimeUnit.SECONDS);
        }
    }
    // Autosave -> write ONLY. An initial unread file is first reconciled.
    private void writeBackup(){
        if(conflictPending)return;
        if(!sessionSynced){requestSync(false);return;}
        final Uri uri=backupUri();
        synchronized(syncLock){
            if(uri==null||!pageReady||pickingBackup||restoringBackup||checkingRemote)return;
            if(documentBusy||!isOnline()){writeDirty=true;return;}
            checkingRemote=true;
        }
        backupIO.execute(()->{
            try{
                String local=localText;
                JSONObject valid=local==null?null:validBackup(local);
                long t=saveTime(valid);
                if(t<0||t<=baseT())return;
                writeDocument(uri,local);
                setBaseT(t);
                prefs.edit().putLong("backupAt",System.currentTimeMillis()).remove("error").apply();
            }catch(Exception e){prefs.edit().putString("error","동기화 대기").apply();}
            finally{
                checkingRemote=false;
                boolean again=writeDirty;writeDirty=false;
                if(again)queueBackup(false);
                notice("");
            }
        });
    }

    // Reads only at startup, resume, online return and explicit sync.
    private void requestSync(boolean gate){
        final Uri uri=backupUri();
        synchronized(syncLock){
            if(!pageReady||pickingBackup||restoringBackup||checkingRemote||conflictPending)return;
            if(uri==null){sessionSynced=false;syncDone();return;}
            if(documentBusy||!isOnline()){sessionSynced=false;syncDone();return;}
            checkingRemote=true;sessionSynced=false;
        }
        if(gate)syncStart();
        backupIO.execute(()->{
            boolean reload=false,ask=false;
            try{
                // I/O errors must be distinguished from empty/corrupt documents.
                String raw=readDocumentTimed(uri);
                JSONObject remote=parseRemote(raw);
                String local=localText;
                JSONObject localObj=null;
                try{if(local!=null)localObj=validBackup(local);}catch(Exception ignored){}
                long lt=saveTime(localObj),rt=saveTime(remote),bt=baseT();
                int decision=decide(lt,rt,bt);
                if(decision==SaveSyncDecider.SYNC_APPLY){
                    restoringBackup=true;reload=true;
                    localText=remote.toString();
                    setBaseT(rt);
                    syncApplied(remote.toString());
                }else if(decision==SaveSyncDecider.SYNC_ASK){
                    ask=true;conflictPending=true;pendingRemote=remote.toString();
                    js("window.ChoseonCloud&&window.ChoseonCloud.onConflict("+
                        JSONObject.quote(remote.toString())+","+
                        JSONObject.quote(localObj.toString())+")");
                }else if(decision==SaveSyncDecider.SYNC_WRITE){
                    writeDocument(uri,local);
                    setBaseT(lt);
                }else if(lt>=0){
                    setBaseT(lt);
                }
                if(!ask){
                    sessionSynced=true;
                    prefs.edit().putLong("backupAt",System.currentTimeMillis()).remove("error").apply();
                }
            }catch(Exception e){
                sessionSynced=false; // preserve local and remote while read fails.
                prefs.edit().putString("error","동기화 대기").apply();
                notice("Drive 파일을 읽지 못했습니다. 기존 저장과 파일은 유지합니다.");
            }finally{
                checkingRemote=false;
                if(!reload&&!ask)syncDone();
                if(!reload&&!ask&&writeDirty){
                    writeDirty=false;queueBackup(false);
                }
            }
        });
    }
    @JavascriptInterface public void cancelApply(){
        restoringBackup=false;
        sessionSynced=false;
        syncDone();
    }
    @JavascriptInterface public void resolveConflict(boolean useFile){
        final Uri uri=backupUri(),remoteUri=uri;
        final String text=pendingRemote;
        if(!conflictPending||text==null||remoteUri==null)return;
        pendingRemote=null;
        backupIO.execute(()->{
            boolean reload=false,success=false;
            try{
                JSONObject remote=parseRemote(text);
                if(remote==null)throw new IllegalArgumentException("invalid remote");
                if(useFile){
                    restoringBackup=true;reload=true;
                    localText=remote.toString();
                    setBaseT(saveTime(remote));
                    syncApplied(remote.toString());
                }else{
                    String local=localText;
                    JSONObject valid=validBackup(local);
                    writeDocument(remoteUri,local);
                    setBaseT(saveTime(valid));
                }
                sessionSynced=true;success=true;
                prefs.edit().putLong("backupAt",System.currentTimeMillis()).remove("error").apply();
            }catch(Exception e){
                sessionSynced=false;
                prefs.edit().putString("error","동기화 대기").apply();
                notice("동기화 선택을 적용하지 못했습니다. 파일을 다시 확인하세요.");
            }finally{
                if(success)conflictPending=false;
                if(!reload&&success)syncDone();
                else if(!success){
                    // Keep the choice pending, no silent fallback that resumes writes.
                    pendingRemote=text;
                    js("window.ChoseonCloud&&window.ChoseonCloud.onConflict("+
                        JSONObject.quote(text)+","+
                        JSONObject.quote(localText==null?"{}":localText)+")");
                }
                if(success&&writeDirty&&!reload){
                    writeDirty=false;queueBackup(false);
                }
            }
        });
    }

    /** First onResume is before the WebView has loaded: webReady handles it. */
    public void onResume(){
        if(firstResume){firstResume=false;return;}
        if(pageReady&&!restoringBackup)
            js("window.ChoseonCloud&&window.ChoseonCloud.requestSync(true)");
    }
    public void flushOnPause(){
        if(pageReady&&!conflictPending&&!restoringBackup)
            js("window.ChoseonCloud&&window.ChoseonCloud.flushSave()");
    }
    public void shutdown(){
        alive=false;pageReady=false;
        if(connectivity!=null&&networkCallback!=null)try{connectivity.unregisterNetworkCallback(networkCallback);}catch(Exception ignored){}
        backupIO.shutdown();documentIO.shutdown();
    }
}

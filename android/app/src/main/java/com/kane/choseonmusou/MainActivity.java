package com.kane.choseonmusou;

import android.app.Activity;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.View;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import androidx.webkit.WebViewAssetLoader;

import org.json.JSONObject;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public final class MainActivity extends Activity {
    // A controlled live branch. The game's JavaScript updates only on a new app
    // launch. Rendering origin remains appassets, preserving existing localStorage.
    private static final String LIVE_URL =
        "https://raw.githubusercontent.com/Alix1211/choseon-musou/mobile-live/index.html";
    private static final String ORIGIN = "https://appassets.androidplatform.net";
    private static final String ASSET_URL = ORIGIN + "/assets/index.html";
    private static final int CREATE_SAVE = 4201, OPEN_SAVE = 4202;
    private static final int MAX_SAVE_BYTES = 14 * 1024 * 1024;
    private WebView webView;
    private byte[] liveIndex;
    private String pendingBackup;
    private boolean alive = true;
    private final Handler main = new Handler(Looper.getMainLooper());
    private final ExecutorService io = Executors.newSingleThreadExecutor();
    private SharedPreferences cloud;
    private volatile long lastAutoBackupTime = 0L;

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        cloud = getSharedPreferences("choseon_cloud", MODE_PRIVATE);
        immersive();
        WebViewAssetLoader loader = new WebViewAssetLoader.Builder()
                .addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this))
                .build();
        webView = new WebView(this);
        webView.setBackgroundColor(0xff080611);
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setMediaPlaybackRequiresUserGesture(true);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);
        webView.addJavascriptInterface(new SaveBridge(), "ChoseonNative");
        webView.setWebChromeClient(new WebChromeClient());
        webView.setWebViewClient(new WebViewClient() {
            @Override public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                if ("appassets.androidplatform.net".equals(uri.getHost()) &&
                        "/assets/index.html".equals(uri.getPath()) && liveIndex != null) {
                    return new WebResourceResponse("text/html", "UTF-8",
                            new ByteArrayInputStream(liveIndex));
                }
                return loader.shouldInterceptRequest(uri);
            }
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                // The game should never navigate its JS bridge to an external origin.
                return !("appassets.androidplatform.net".equals(uri.getHost())
                        && "https".equals(uri.getScheme()));
            }
        });
        setContentView(webView);
        // Do not replace the page during a mission. Load once after an async
        // check; on failure use last verified update, then bundled game.
        io.execute(() -> {
            byte[] verified = downloadLatestIndex();
            if (verified == null) verified = readCachedIndex();
            liveIndex = verified;
            main.post(() -> {
                if (alive && webView != null) webView.loadUrl(ASSET_URL);
            });
        });
    }

    private byte[] downloadLatestIndex() {
        HttpURLConnection conn = null;
        try {
            conn = (HttpURLConnection)new URL(LIVE_URL + "?v=" + System.currentTimeMillis()).openConnection();
            conn.setConnectTimeout(2800);
            conn.setReadTimeout(4000);
            conn.setUseCaches(false);
            conn.setRequestProperty("Cache-Control", "no-cache");
            conn.setRequestProperty("Accept", "text/html");
            if (conn.getResponseCode() != 200) return null;
            ByteArrayOutputStream out = new ByteArrayOutputStream(380000);
            try (InputStream in = conn.getInputStream()) {
                byte[] buf = new byte[16384];
                for (int n; (n = in.read(buf)) != -1;) {
                    if (out.size() + n > 1500000) return null;
                    out.write(buf, 0, n);
                }
            }
            byte[] bytes = out.toByteArray();
            if (!validIndex(bytes)) return null;
            File tmp = new File(getFilesDir(), "latest_index.tmp");
            File cache = new File(getFilesDir(), "latest_index.html");
            try(FileOutputStream stream = new FileOutputStream(tmp)) {stream.write(bytes);}
            if(!tmp.renameTo(cache)) {
                try(FileOutputStream stream = new FileOutputStream(cache)) {stream.write(bytes);}
                //noinspection ResultOfMethodCallIgnored
                tmp.delete();
            }
            return bytes;
        } catch(Exception e) {return null;}
        finally {if(conn != null) conn.disconnect();}
    }

    private boolean validIndex(byte[] bytes) {
        if (bytes == null || bytes.length < 120000 || bytes.length > 1500000) return false;
        String html = new String(bytes, StandardCharsets.UTF_8);
        return html.contains("CHOSEON_LIVE_UPDATE:") &&
                html.contains("const SAVEKEY='choseon_musou_v2'") &&
                html.contains("function endStage()") &&
                html.contains("window.ChoseonCloud=");
    }

    private byte[] readCachedIndex() {
        File file = new File(getFilesDir(), "latest_index.html");
        if (!file.isFile()) return null;
        try (FileInputStream in = new FileInputStream(file)) {
            byte[] buf = new byte[(int)Math.min(file.length(),1500001)];
            int off=0, n;
            while(off<buf.length && (n=in.read(buf,off,buf.length-off))!=-1) off+=n;
            if(off!=buf.length) return null;
            return validIndex(buf) ? buf : null;
        } catch (Exception e) {return null;}
    }

    private class SaveBridge {
        @JavascriptInterface public boolean hasBackupFile() {
            return !cloud.getString("uri", "").isEmpty();
        }
        @JavascriptInterface public void createBackup(String json) {
            if(json == null || json.length() > MAX_SAVE_BYTES) {report(false,"백업 데이터가 너무 큽니다");return;}
            main.post(() -> {
                String stored=cloud.getString("uri","");
                if(!stored.isEmpty()) {writeJson(Uri.parse(stored),json,false);return;}
                pendingBackup=json;
                Intent intent=new Intent(Intent.ACTION_CREATE_DOCUMENT);
                intent.addCategory(Intent.CATEGORY_OPENABLE);
                intent.setType("application/json");
                intent.putExtra(Intent.EXTRA_TITLE,"Choseon-Musou-Save.json");
                intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_WRITE_URI_PERMISSION |
                                Intent.FLAG_GRANT_PERSISTABLE_URI_PERMISSION);
                try {startActivityForResult(intent,CREATE_SAVE);}
                catch(Exception e){pendingBackup=null;report(false,"Android 파일 저장 창을 열 수 없습니다");}
            });
        }
        @JavascriptInterface public void autoBackup(String json) {
            String stored=cloud.getString("uri","");
            if(stored.isEmpty() || json==null || json.length()>MAX_SAVE_BYTES)return;
            long now=System.currentTimeMillis();
            if(now-lastAutoBackupTime<90000)return;
            lastAutoBackupTime=now;
            writeJson(Uri.parse(stored),json,true);
        }
        @JavascriptInterface public void openBackup() {
            main.post(() -> {
                Intent intent=new Intent(Intent.ACTION_OPEN_DOCUMENT);
                intent.addCategory(Intent.CATEGORY_OPENABLE);
                intent.setType("application/json");
                intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                try {startActivityForResult(intent,OPEN_SAVE);}
                catch(Exception e){report(false,"Android 파일 열기 창을 열 수 없습니다");}
            });
        }
    }

    private void writeJson(Uri uri, String json, boolean automatic) {
        io.execute(() -> {
            try {
                JSONObject parsed = new JSONObject(json);
                if(!"choseon-musou-drive-backup".equals(parsed.optString("format")))
                    throw new Exception("백업 형식이 올바르지 않습니다");
                try(OutputStream output=getContentResolver().openOutputStream(uri,"wt")) {
                    if(output==null)throw new Exception("선택한 저장소를 열 수 없습니다");
                    output.write(json.getBytes(StandardCharsets.UTF_8));
                    output.flush();
                }
                cloud.edit().putString("uri",uri.toString()).apply();
                if(!automatic)report(true,"저장 파일을 기록했습니다. Google Drive를 선택했다면 Drive에서 확인하세요.");
            } catch(Exception e) {
                if(!automatic)report(false,"백업 실패: "+e.getMessage());
                // A stale, disconnected provider must not be silently overwritten.
                if(automatic)cloud.edit().remove("uri").apply();
            }
        });
    }

    @Override protected void onActivityResult(int requestCode,int resultCode,Intent data) {
        super.onActivityResult(requestCode,resultCode,data);
        if(resultCode!=RESULT_OK||data==null||data.getData()==null){
            if(requestCode==CREATE_SAVE){pendingBackup=null;report(false,"저장을 취소했습니다");}
            return;
        }
        Uri uri=data.getData();
        if(requestCode==CREATE_SAVE) {
            try {
                getContentResolver().takePersistableUriPermission(uri,
                    Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_WRITE_URI_PERMISSION);
            }catch(Exception ignored){}
            String json=pendingBackup;pendingBackup=null;
            if(json!=null)writeJson(uri,json,false);
        } else if(requestCode==OPEN_SAVE) {
            io.execute(() -> {
                try(InputStream input=getContentResolver().openInputStream(uri)) {
                    if(input==null)throw new Exception("선택한 파일을 열 수 없습니다");
                    ByteArrayOutputStream out=new ByteArrayOutputStream();
                    byte[] buf=new byte[8192];int n;
                    while((n=input.read(buf))!=-1){
                        if(out.size()+n>MAX_SAVE_BYTES)throw new Exception("저장 파일이 너무 큽니다");
                        out.write(buf,0,n);
                    }
                    String json=out.toString("UTF-8");
                    evaluate("window.ChoseonCloud&&window.ChoseonCloud.importJson(" +
                             JSONObject.quote(json)+")");
                } catch(Exception e){report(false,"복원 파일 읽기 실패: "+e.getMessage());}
            });
        }
    }

    private void report(boolean ok,String message){
        evaluate("window.ChoseonCloud&&window.ChoseonCloud.onNativeStatus("+
                ok+","+JSONObject.quote(message)+")");
    }
    private void evaluate(String script) {
        main.post(() -> {if(alive&&webView!=null)webView.evaluateJavascript(script,null);});
    }

    @SuppressWarnings("deprecation")
    private void immersive(){
        getWindow().getDecorView().setSystemUiVisibility(
           View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY | View.SYSTEM_UI_FLAG_FULLSCREEN |
           View.SYSTEM_UI_FLAG_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN |
           View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_LAYOUT_STABLE);
    }
    @Override public void onWindowFocusChanged(boolean focused) {
        super.onWindowFocusChanged(focused);if(focused)immersive();
    }
    @Override protected void onPause() {
        if(webView!=null){
            webView.evaluateJavascript("if(typeof pauseGame==='function'&&typeof UI!=='undefined'&&UI.mode==='battle'&&!UI.paused)pauseGame(true)",null);
            webView.onPause();
        }
        super.onPause();
    }
    @Override protected void onResume() {super.onResume();if(webView!=null)webView.onResume();immersive();}
    @SuppressWarnings("deprecation")
    @Override public void onBackPressed() {
        if(webView!=null)webView.evaluateJavascript(
           "document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}))",null);
        else super.onBackPressed();
    }
    @Override protected void onDestroy() {
        alive=false;
        if(webView!=null){webView.destroy();webView=null;}
        io.shutdownNow();
        super.onDestroy();
    }
}

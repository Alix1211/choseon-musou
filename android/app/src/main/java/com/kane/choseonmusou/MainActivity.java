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
    private boolean alive = true;
    private final Handler main = new Handler(Looper.getMainLooper());
    private final ExecutorService io = Executors.newSingleThreadExecutor();
    private SaveSyncManager sync;
    private GameHaptics haptics;

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
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
        sync = new SaveSyncManager(this, webView);
        webView.addJavascriptInterface(sync, "ChoseonNative");
        haptics = new GameHaptics(this);
        webView.addJavascriptInterface(haptics, "ChoseonHaptics");
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
                html.contains("CHOSEON_GAME_REVISION: 20261031-hero-attack-v1") &&
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

    @Override protected void onActivityResult(int requestCode,int resultCode,Intent data) {
        super.onActivityResult(requestCode,resultCode,data);
        if(sync!=null)sync.onActivityResult(requestCode,resultCode,data);
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
        if(haptics!=null)haptics.cancel();
        if(sync!=null)sync.flushOnPause();
        if(webView!=null){
            webView.evaluateJavascript("if(typeof pauseGame==='function'&&typeof UI!=='undefined'&&UI.mode==='battle'&&!UI.paused)pauseGame(true)",null);
            webView.onPause();
        }
        super.onPause();
    }
    @Override protected void onResume() {super.onResume();if(webView!=null)webView.onResume();immersive();if(sync!=null)sync.onResume();}
    @SuppressWarnings("deprecation")
    @Override public void onBackPressed() {
        if(webView!=null)webView.evaluateJavascript(
           "document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}))",null);
        else super.onBackPressed();
    }
    @Override protected void onDestroy() {
        alive=false;
        if(haptics!=null)haptics.cancel();
        if(sync!=null)sync.shutdown();
        if(webView!=null){webView.destroy();webView=null;}
        io.shutdownNow();
        super.onDestroy();
    }
}

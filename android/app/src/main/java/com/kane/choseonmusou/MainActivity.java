package com.kane.choseonmusou;

import android.app.Activity;
import android.os.Bundle;
import android.view.View;
import android.view.WindowManager;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import androidx.webkit.WebViewAssetLoader;

public final class MainActivity extends Activity {
    private WebView webView;

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
        webView.setWebChromeClient(new WebChromeClient());
        webView.setWebViewClient(new WebViewClient() {
            @Override public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                return loader.shouldInterceptRequest(request.getUrl());
            }
        });
        setContentView(webView);
        webView.loadUrl("https://appassets.androidplatform.net/assets/index.html");
    }

    @SuppressWarnings("deprecation")
    private void immersive() {
        getWindow().getDecorView().setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY | View.SYSTEM_UI_FLAG_FULLSCREEN |
                View.SYSTEM_UI_FLAG_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN |
                View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_LAYOUT_STABLE);
    }

    @Override public void onWindowFocusChanged(boolean focused) {
        super.onWindowFocusChanged(focused);
        if(focused)immersive();
    }

    @Override protected void onPause() {
        if(webView != null){
            webView.evaluateJavascript("if(typeof pauseGame==='function'&&typeof UI!=='undefined'&&UI.mode==='battle'&&!UI.paused)pauseGame(true)",null);
            webView.onPause();
        }
        super.onPause();
    }

    @Override protected void onResume() {
        super.onResume();
        if(webView != null)webView.onResume();
        immersive();
    }

    @SuppressWarnings("deprecation")
    @Override public void onBackPressed() {
        if(webView != null)webView.evaluateJavascript(
                "document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}))",null);
        else super.onBackPressed();
    }

    @Override protected void onDestroy(){
        if(webView!=null){webView.destroy();webView=null;}
        super.onDestroy();
    }
}

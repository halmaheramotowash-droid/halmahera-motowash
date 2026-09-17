package com.halmahera.motowash;

import android.os.Bundle;
import androidx.activity.OnBackPressedCallback;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        getOnBackPressedDispatcher().addCallback(
            this,
            new OnBackPressedCallback(true) {
                @Override
                public void handleOnBackPressed() {
                    if (getBridge() == null || getBridge().getWebView() == null) {
                        return;
                    }

                    getBridge().getWebView().evaluateJavascript(
                        "(function() {" +
                        "const path = window.location.pathname;" +

                        "if (path === '/owner' || path === '/owner/') {" +
                        "  const shouldLogout = window.confirm('Apakah Anda ingin logout?');" +
                        "  if (shouldLogout) {" +
                        "    fetch('/api/logout', { method: 'POST' })" +
                        "      .then(() => { window.location.href = '/login'; })" +
                        "      .catch(() => { window.location.href = '/login'; });" +
                        "  }" +
                        "} else if (window.history.length > 1) {" +
                        "  window.history.back();" +
                        "} else {" +
                        "  window.location.href = '/owner';" +
                        "}" +
                        "})()",
                        null
                    );
                }
            }
        );
    }
}
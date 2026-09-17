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
                        "  window.dispatchEvent(new Event('open-logout-modal'));" +
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
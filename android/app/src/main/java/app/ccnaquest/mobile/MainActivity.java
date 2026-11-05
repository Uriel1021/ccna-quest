package app.ccnaquest.mobile;

import android.net.Uri;
import android.os.Bundle;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebView;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.BridgeWebViewClient;

import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        registerPlugin(FocusLockPlugin.class); // Modo Enfoque (debe registrarse antes de super.onCreate)
        super.onCreate(savedInstanceState);
        bridge.setWebViewClient(new StaticExportWebViewClient(this));
    }

    /**
     * Capacitor entrega index.html (Inicio) para cualquier ruta sin extensión, como una SPA.
     * Nuestra app es una exportación estática de Next.js con una página HTML por ruta
     * (p. ej. /aprender/modulo-4/index.html). Este cliente sirve el HTML correcto cuando
     * la app se recarga o abre directamente en una subpágina; todo lo demás lo delega a Capacitor.
     */
    private static final class StaticExportWebViewClient extends BridgeWebViewClient {
        private final MainActivity activity;

        StaticExportWebViewClient(MainActivity activity) {
            super(activity.getBridge());
            this.activity = activity;
        }

        @Override
        public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
            Uri url = request.getUrl();
            String path = url.getPath();
            if (request.isForMainFrame() && "localhost".equals(url.getHost()) && path != null && path.length() > 1) {
                String last = path.substring(path.lastIndexOf('/') + 1);
                if (!last.contains(".")) {
                    String dir = path.endsWith("/") ? path : path + "/";
                    String asset = "public" + dir + "index.html";
                    try {
                        InputStream in = activity.getAssets().open(asset);
                        Map<String, String> headers = new HashMap<>();
                        headers.put("Cache-Control", "no-cache");
                        return new WebResourceResponse("text/html", "utf-8", 200, "OK", headers, in);
                    } catch (IOException ignored) {
                        // No existe esa página: Capacitor mostrará Inicio / 404.
                    }
                }
            }
            return super.shouldInterceptRequest(view, request);
        }
    }
}

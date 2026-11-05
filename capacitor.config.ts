import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "app.ccnaquest.mobile",
  appName: "CCNA Quest",
  webDir: "out",
  android: {
    // La app se sirve desde https://localhost dentro del teléfono.
    allowMixedContent: false,
    webContentsDebuggingEnabled: true, // permite depurar con chrome://inspect (quitar para la tienda)
  },
  plugins: {
    StatusBar: { overlaysWebView: false, style: "DEFAULT" },
  },
};

export default config;

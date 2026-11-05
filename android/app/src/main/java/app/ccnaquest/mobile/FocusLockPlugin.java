package app.ccnaquest.mobile;

import android.app.Activity;
import android.app.ActivityManager;
import android.content.Context;
import android.view.WindowManager;


import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * Modo Enfoque nativo.
 *  - start():  pide fijar la app en pantalla (startLockTask → Android muestra "Fijar app" y el
 *              usuario confirma) y mantiene la pantalla encendida.
 *              Mientras está fijada: no hay botón de inicio ni de recientes, ni panel de notificaciones.
 *  - stop():   libera todo lo anterior.
 *  - status(): indica si la app sigue fijada (para detectar si el alumno salió).
 *
 * Nota: en un teléfono personal Android siempre permite salir manteniendo Atrás + Recientes
 * y hacer llamadas de emergencia. El bloqueo total (kiosco) requiere que la app sea
 * "Device Owner", lo que solo se configura en equipos dedicados.
 */
@CapacitorPlugin(name = "FocusLock")
public class FocusLockPlugin extends Plugin {

    @PluginMethod
    public void start(PluginCall call) {
        Activity activity = getActivity();
        activity.runOnUiThread(() -> {
            try {
                // No se ocultan las barras: la fijación ya desactiva Inicio, Recientes y el panel de
                // notificaciones, y ocultarlas mostraría un aviso de Android encima del de fijación.
                activity.getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
                activity.startLockTask(); // Android pide al usuario confirmar "Fijar app"
                call.resolve(state());
            } catch (Exception e) {
                call.reject("No se pudo fijar la pantalla: " + e.getMessage());
            }
        });
    }

    @PluginMethod
    public void stop(PluginCall call) {
        Activity activity = getActivity();
        activity.runOnUiThread(() -> {
            activity.getWindow().clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
            try {
                if (lockState() != ActivityManager.LOCK_TASK_MODE_NONE) activity.stopLockTask();
            } catch (Exception ignored) {
                // Si el usuario ya salió de la fijación, no hay nada que detener.
            }
            call.resolve(state());
        });
    }

    @PluginMethod
    public void status(PluginCall call) {
        call.resolve(state());
    }

    private int lockState() {
        ActivityManager am = (ActivityManager) getContext().getSystemService(Context.ACTIVITY_SERVICE);
        return am.getLockTaskModeState();
    }

    private JSObject state() {
        int s = lockState();
        JSObject r = new JSObject();
        r.put("locked", s != ActivityManager.LOCK_TASK_MODE_NONE);
        r.put("mode", s == ActivityManager.LOCK_TASK_MODE_PINNED ? "pinned" : s == ActivityManager.LOCK_TASK_MODE_LOCKED ? "kiosk" : "none");
        return r;
    }
}

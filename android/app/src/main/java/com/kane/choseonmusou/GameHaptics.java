package com.kane.choseonmusou;

import android.content.Context;
import android.os.Build;
import android.os.SystemClock;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.os.VibratorManager;
import android.webkit.JavascriptInterface;

/** Named, bounded game cues for Android WebView. Never accepts raw JS durations. */
public final class GameHaptics {
    private final Vibrator vibrator;
    private long busyUntil;
    private long lastPlayed;
    private int priority;

    public GameHaptics(Context context) {
        Vibrator available = null;
        if (Build.VERSION.SDK_INT >= 31) {
            VibratorManager manager = (VibratorManager) context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE);
            if (manager != null) available = manager.getDefaultVibrator();
        }
        if (available == null) available = (Vibrator) context.getSystemService(Context.VIBRATOR_SERVICE);
        vibrator = available;
    }

    @JavascriptInterface
    public synchronized String play(String cue) {
        if (vibrator == null || !vibrator.hasVibrator()) return "unavailable";
        final int ms, strength, level;
        final boolean doublePulse;
        switch (cue) {
            case "light":       ms=34;  strength=215; level=1; doublePulse=false; break;
            case "heavy":       ms=105; strength=245; level=2; doublePulse=false; break;
            case "combo":       ms=205; strength=255; level=3; doublePulse=true;  break;
            case "hurt":        ms=80;  strength=235; level=2; doublePulse=false; break;
            case "musou":       ms=125; strength=255; level=4; doublePulse=false; break;
            case "musouFinal":  ms=205; strength=255; level=5; doublePulse=true;  break;
            case "test":        ms=120; strength=255; level=5; doublePulse=false; break;
            default: return "invalid";
        }
        long now=SystemClock.elapsedRealtime();
        // Damage ticks and rapid attacks can arrive in the same 60 Hz frame.
        // Preserve strong combo / final-blow cues against weaker interruptions.
        if (now<busyUntil && level<priority) return "ok";
        if (now-lastPlayed<55 && level<=priority) return "ok";
        try {
            if (Build.VERSION.SDK_INT >= 26) {
                final boolean amplitude=vibrator.hasAmplitudeControl();
                if (doublePulse) {
                    long[] timings={0,75,25,105};
                    if (amplitude) {
                        int[] amps={0,225,0,strength};
                        vibrator.vibrate(VibrationEffect.createWaveform(timings,amps,-1));
                    } else vibrator.vibrate(VibrationEffect.createWaveform(timings,-1));
                } else vibrator.vibrate(VibrationEffect.createOneShot(ms,
                        amplitude?strength:VibrationEffect.DEFAULT_AMPLITUDE));
            } else if (doublePulse) {
                //noinspection deprecation
                vibrator.vibrate(new long[]{0,75,25,105},-1);
            } else {
                //noinspection deprecation
                vibrator.vibrate(ms);
            }
            lastPlayed=now;priority=level;busyUntil=now+ms;
            return "ok";
        } catch (RuntimeException e) {
            return "unavailable";
        }
    }

    @JavascriptInterface
    public synchronized void cancel() {
        if (vibrator!=null) {
            try {vibrator.cancel();}catch(RuntimeException ignored) {}
        }
        busyUntil=0;priority=0;
    }
}

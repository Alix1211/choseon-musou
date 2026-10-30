package com.kane.choseonmusou;

/** ARPG docs/standards/drive_save_sync.md: same decision order, no time-race. */
public final class SaveSyncDecider {
    private SaveSyncDecider() {}
    public static final int SYNC_NONE = 0, SYNC_WRITE = 1, SYNC_APPLY = 2, SYNC_ASK = 3;
    // lt: local save time; rt: selected Drive file time (-1 if missing/corrupt);
    // bt: last matched time for THIS device (-1 if unknown).
    public static int decide(long lt, long rt, long bt) {
        if (rt < 0) return lt >= 0 ? SYNC_WRITE : SYNC_NONE;
        if (lt < 0) return SYNC_APPLY;
        if (lt == rt) return SYNC_NONE;
        boolean localChanged = lt > bt, remoteChanged = rt > bt;
        if (remoteChanged && !localChanged) return SYNC_APPLY;
        if (localChanged && !remoteChanged) return SYNC_WRITE;
        return SYNC_ASK;
    }
}

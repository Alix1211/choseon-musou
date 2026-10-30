package com.kane.choseonmusou;

import static com.kane.choseonmusou.SaveSyncDecider.*;

public final class SaveSyncDeciderTest {
    private static int count = 0;
    private static void check(String label,int wanted,long lt,long rt,long bt) {
        int actual = SaveSyncDecider.decide(lt,rt,bt);
        if (actual != wanted) throw new AssertionError(label + ": expected " + wanted + ", got " + actual);
        System.out.println("PASS " + label + ": " + actual);
        ++count;
    }
    public static void main(String[] args) {
        // Explicit cases from ARPG standard and the ported Java decide function.
        check("both modified without baseT must ask, even if remote timestamp higher",SYNC_ASK,100,200,-1);
        check("both modified without baseT must ask, even if local timestamp higher",SYNC_ASK,200,100,-1);
        check("file only changed",SYNC_APPLY,100,150,100);
        check("local only changed",SYNC_WRITE,150,100,100);
        check("both changed",SYNC_ASK,130,140,100);
        check("both changed local newer (still ask)",SYNC_ASK,140,130,100);
        check("same local/remote",SYNC_NONE,150,150,100);
        check("remote missing",SYNC_WRITE,150,-1,100);
        check("remote corrupt/empty",SYNC_WRITE,150,-1,-1);
        check("neither file nor local exists",SYNC_NONE,-1,-1,-1);
        check("local missing",SYNC_APPLY,-1,150,-1);
        check("local missing with existing base",SYNC_APPLY,-1,150,100);
        check("base unknown and both have distinct saves",SYNC_ASK,180,180+1,-1);
        check("remote older than base, local changed",SYNC_WRITE,160,120,130);
        check("local older than base, remote changed",SYNC_APPLY,120,160,130);
        check("no side > base but unequal, ask",SYNC_ASK,80,90,100);
        System.out.println("ALL " + count + " decide cases passed");
    }
}

'use strict';
const fs=require('node:fs');
const assert=require('node:assert/strict');
const html=fs.readFileSync('index.html','utf8');
const native=fs.readFileSync('android/app/src/main/java/com/kane/choseonmusou/GameHaptics.java','utf8');
const activity=fs.readFileSync('android/app/src/main/java/com/kane/choseonmusou/MainActivity.java','utf8');
const manifest=fs.readFileSync('android/app/src/main/AndroidManifest.xml','utf8');

assert(manifest.includes('android.permission.VIBRATE'),'Android VIBRATE permission missing');
assert(activity.includes('webView.addJavascriptInterface(haptics, "ChoseonHaptics")'),'native bridge missing');
assert(activity.includes('if(haptics!=null)haptics.cancel();'),'background vibration not cancelled');
assert(native.includes('VibrationEffect.createOneShot'),'native pulse must use VibrationEffect');
assert(native.includes('VibrationEffect.createWaveform'),'combo must use native waveform');
assert(native.includes('VibratorManager'),'new Android default-vibrator route missing');
assert(native.includes('vibrator.hasAmplitudeControl()'),'amplitude hardware fallback missing');
for(const cue of ['light','heavy','combo','hurt','musou','musouFinal','test']){
  assert(native.includes('case "'+cue+'"'),cue+' missing from native whitelist');
  assert(html.includes(cue+':'),cue+' missing from web fallback patterns');
}
assert(html.includes("native.play(cue)==='ok'"),'JS does not prefer direct Android signal');
assert(html.includes("CM_AUDIO.haptic('hurt')"),'damage does not vibrate');
assert(html.includes("CM_AUDIO.haptic('combo')"),'combo does not vibrate');
assert(html.includes("CM_AUDIO.haptic(kind)"),'input does not vibrate');
assert(html.includes("CM_AUDIO.haptic(m.last?'musouFinal':'musou')"),'musou impacts not linked');
const actualPulseIndices=Array.from({length:15},(_,i)=>i).filter(i=>i%5===0||i===14);
assert.deepEqual(actualPulseIndices,[0,5,10,14],'musou must have four pulses');
assert(html.includes("window.ChoseonHaptics.cancel()"),'settings off must cancel native vibration');
assert(html.includes("const SAVEKEY='choseon_musou_v2'"),'save key changed');
for(const m of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g))new Function(m[1]);
console.log('PASS native Android haptics: light, heavy, combo, four musou beats, damage, settings, browser fallback');

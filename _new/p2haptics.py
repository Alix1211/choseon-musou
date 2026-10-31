"""Native Android haptics for combat, with browser vibration fallback.

Do not change save keys, hero attacks, combo sequencing, or the audio settings UI.
"""
rep("  function vibrate(pattern){\n    if(!settings.vibration||document.hidden||UI.settingsOpen)return false;",
    """  const HAPTIC_FALLBACK={light:34,heavy:105,combo:[75,25,105],hurt:80,
    musou:125,musouFinal:[75,25,130],test:120};
  function haptic(cue){
    if(!settings.vibration||document.hidden||(UI.settingsOpen&&cue!=='test'))return false;
    if(!Object.prototype.hasOwnProperty.call(HAPTIC_FALLBACK,cue))return false;
    try{
      const native=window.ChoseonHaptics;
      if(native&&typeof native.play==='function'&&native.play(cue)==='ok')return true;
    }catch(e){}
    try{return navigator.vibrate?!!navigator.vibrate(HAPTIC_FALLBACK[cue]):false;}
    catch(e){return false;}
  }
  function vibrate(pattern){
    if(!settings.vibration||document.hidden||UI.settingsOpen)return false;""")
rep("    if(!on){try{if(navigator.vibrate)navigator.vibrate(0);}catch(e){}}",
    """    if(on)haptic('test');
    else{
      try{if(window.ChoseonHaptics)window.ChoseonHaptics.cancel();}catch(e){}
      try{if(navigator.vibrate)navigator.vibrate(0);}catch(e){}
    }""")
rep("  return {play,playVoice,stopVoice,sync,pause,setVolume,setVibration,vibrate,",
    "  return {play,playVoice,stopVoice,sync,pause,setVolume,setVibration,vibrate,haptic,")

# Physical input is acknowledged immediately; stronger combos override the
# corresponding short/long tap only when the special move actually activates.
rep("  CB.accepted++;\n  return true;",
    "  CB.accepted++;\n  if(kind==='light'||kind==='heavy')CM_AUDIO.haptic(kind);\n  return true;")
rep("    if(voiceNum)CM_AUDIO.playVoice('skill_'+w+'_0'+voiceNum,1);\n  }\n  return true;",
    "    if(voiceNum)CM_AUDIO.playVoice('skill_'+w+'_0'+voiceNum,1);\n    CM_AUDIO.haptic('combo');\n  }\n  return true;")
rep("  const v=base*100/(100+stat.def());\n  CM_AUDIO.play('punch');",
    "  const v=base*100/(100+stat.def());\n  CM_AUDIO.play('punch');\n  CM_AUDIO.haptic('hurt');")

# Four separate pulses synchronize with four actual meteor impacts, not with
# the full 15-frame animation loop. Last impact is especially strong.
rep("  CM_AUDIO.play('spin');\n  CM_AUDIO.playVoice('skill_musou_01',1);",
    "  CM_AUDIO.play('spin');\n  CM_AUDIO.haptic('heavy');\n  CM_AUDIO.playVoice('skill_musou_01',1);")
rep("  CM_AUDIO.play('explosion');shake=Math.max(shake,m.last?19:9);",
    "  if(ULT.next%5===0||m.last)CM_AUDIO.haptic(m.last?'musouFinal':'musou');\n  CM_AUDIO.play('explosion');shake=Math.max(shake,m.last?19:9);")

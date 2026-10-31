# Replace the audio/pause modules after voice and native-sync overlays.
a=src.index('/* 사용자 제공 BGM 3곡 / 골든퀘스트 파일 효과음.')
b=src.index('function startAttack(',a)
src=src[:a]+rd('m3_audio_settings.js')+'\n\n'+src[b:]
a=src.index('function pauseGame(on){')
b=src.index('function bark(kind){',a)
src=src[:a]+rd('m3_settings.js')+'\n\n'+src[b:]
rep('<button id="pause" hidden title="일시정지" aria-label="일시정지">Ⅱ</button>',
    '<button id="pause" hidden title="설정" aria-label="설정" aria-haspopup="dialog">⚙</button>')
rep('  cloudmenu(){UI.cloudMenu=!UI.cloudMenu;renderTitle();},',
    '  cloudmenu(){openSettings();},')
rep('try{if(navigator.vibrate)navigator.vibrate(ms||180);}catch(e){}',
    'CM_AUDIO.vibrate(ms||180);')
rep('  UI.mode=m;UI.paused=false;',
    "  UI.mode=m;UI.paused=false;UI.settingsOpen=false;CM_AUDIO.stopVoice();")
rep("  if(e.key==='Escape'&&UI.mode==='battle')pauseGame(!UI.paused);",
    "  if(e.key==='Escape'&&(UI.settingsOpen||UI.mode==='battle')){e.preventDefault();if(UI.settingsOpen)closeSettings();else openSettings();}")
rep("$('pause').addEventListener('click',()=>pauseGame(true));",
    "$('pause').addEventListener('click',openSettings);")
rep("  resume(){pauseGame(false);},", "  resume(){closeSettings();},")
rep("  retreat(){UI.paused=false;$('s_pz').hidden=true;$('pause').hidden=true;M=null;mobs.length=0;allies.length=0;showScreen('scn');},",
    "  retreat(){exitSettingsBattle();},")
rep('</style>',rd('settings.css')+'\n</style>')

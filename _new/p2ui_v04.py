"""v0.4 전투 HUD: 체력/목표, 우상단 미니맵, 작은 일시정지."""

a=src.index('<div class="hud" id="top">')
b=src.index('<div id="banner">',a)
assert 'id="buffs"' in src[a:b] and 'id="revq"' in src[a:b]
src=src[:a]+'''<div class="hud" id="top">
  <div id="tl">
    <div id="hpw"><div id="hpb"></div><div id="hpt"></div></div>
    <div id="obj"></div>
    <div id="xpw"><div id="xpb"></div></div>
    <div id="spw" title="무쌍 게이지"><div id="spb"></div></div>
    <div id="dbf"></div><div id="buffs"></div><div id="revq"></div>
  </div>
  <div id="tr"><div id="stage"></div><canvas id="mm" width="150" height="110"></canvas></div>
</div>''' +src[b:]

rep('<button id="pause" hidden>일시정지</button>',
    '<button id="pause" hidden title="일시정지" aria-label="일시정지">Ⅱ</button>')

hud_css = r'''
/* v0.4: 화면 왼쪽에는 생존/목표 정보, 오른쪽에는 단계/지도만 둔다. */
#top{align-items:flex-start;gap:12px;z-index:5}
#tl{max-width:min(355px,47vw);gap:5px}
#hpw{width:min(330px,46vw);height:18px;border-radius:9px}
#hpt{font-size:11px;line-height:16px}
#obj{max-width:min(330px,46vw);font-size:13px;line-height:1.3}
#xpw,#spw{width:min(330px,46vw)}
#tr{display:flex;flex-direction:column;align-items:flex-end;gap:4px;max-width:36vw}
#tr #stage{font-size:11px;line-height:14px;font-weight:600;color:#eee6df;opacity:.88;white-space:nowrap}
#tr #mm{position:static;display:block;width:176px;height:124px;max-width:35vw;margin-top:0;pointer-events:none;border:1px solid #9b83a9;border-radius:9px;background:rgba(12,9,20,.68)}
#pause{position:fixed;right:calc(max(16px,env(safe-area-inset-right,0px)) + 184px);top:calc(max(8px,env(safe-area-inset-top,0px)) + 20px);width:28px;height:29px;min-height:0;padding:0;border:0;background:rgba(10,8,16,.35);border-radius:5px;color:#fff;font:800 20px/29px system-ui,sans-serif;text-shadow:0 1px 4px #000;box-shadow:none;z-index:6;touch-action:manipulation;pointer-events:auto}
@media(max-width:700px){#tr #mm{width:126px;height:95px}#pause{right:calc(max(16px,env(safe-area-inset-right,0px)) + 136px);top:calc(max(8px,env(safe-area-inset-top,0px)) + 17px);width:26px;height:27px;font-size:18px}}
'''
rep('</style>\n<canvas id="c">', hud_css + '\n</style>\n<canvas id="c">')

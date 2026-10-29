"""기존 빌드에서 위나라 1~10판 선택 시험본을 만든다. 게임 본체를 직접 수정하지 않는다."""
from pathlib import Path
root=Path(__file__).resolve().parent.parent
src=(root/'index.html').read_text()
src=src.replace("const SAVEKEY='choseon_musou_v2';","const SAVEKEY='choseon_musou_wei_test_v1';")
# 미리보기 서버가 JS 문자열의 SVG 닫기 태그 사이에 갱신 코드를 넣지 않게 한다.
i=src.index('<script>');j=src.rindex('</script>')
src=src[:i]+src[i:j].replace('</svg>','<\\/svg>')+src[j:]
names=['하후돈','하후연','견희','허저','장료','채문희','조비','왕이','허창 진입','조조']
options=''.join(f'<option value="{i}">{i}판 · {n}</option>' for i,n in enumerate(names,1))
bar='''<div id="weiTest" style="position:fixed;top:8px;left:50%;transform:translateX(-50%);z-index:9999;display:flex;gap:6px"><select id="weiPick" style="font:700 15px system-ui;padding:8px;background:#281d32;color:#fff4d0;border:2px solid #d5ae59;border-radius:8px">OPTIONS</select><button id="weiGo" disabled style="font:700 15px system-ui;padding:8px 14px;color:#fff4d0;background:#542344;border:2px solid #d5ae59;border-radius:8px;white-space:nowrap">선택한 판 시작</button></div><script>
const weiButton=document.getElementById('weiGo');
weiButton.onclick=()=>{G.UI.paused=false;document.getElementById('s_pz').hidden=true;G.startStage(Number(document.getElementById('weiPick').value),1);};
setInterval(()=>{weiButton.disabled=!window.G;document.getElementById('weiTest').style.display=!!window.G&&G.UI.mode!=='title'&&!G.UI.paused?'none':'flex';},200);
</script>'''.replace('OPTIONS',options)
base='https://raw.githubusercontent.com/Alix1211/choseon-musou/0c89b8b4bc2c7b938195fb78b89bff84893f6110/'
(root/'wei-test.html').write_text('<!doctype html><html><head><meta charset="utf-8"><base href="'+base+'">\n'+src+bar+'</body></html>')
print('wei-test.html 생성 완료')

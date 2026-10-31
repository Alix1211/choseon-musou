"""Apply pending source patches IN MEMORY and check them without a game/APK build."""
import ast
import json
from pathlib import Path
import re
import subprocess
import sys

root=Path(__file__).resolve().parents[1]
baseline=Path(sys.argv[1]) if len(sys.argv)>1 else root/'index.html'
state={'src':baseline.read_text()}
def rep(old,new,cnt=1):
    assert state['src'].count(old)==cnt,('patch anchor mismatch',old[:100])
    state['src']=state['src'].replace(old,new)
state['rep']=rep
state['rd']=lambda n:(root/'_new'/n).read_text()
for name,marker in [('p2balance.py','const CAMPAIGN_BALANCE='),('p2combat_timing.py','const COMBO_TIMING='),('p2settings.py','function settingsSyncBlocked()')]:
    code=(root/'_new'/name).read_text();ast.parse(code)
    if marker not in state['src']:
        exec(compile(code,name,'exec'),state)
source=state['src']
combo=source[source.index('const COMBO_TIMING='):source.index('const ULT=')]
payload={'combo':combo,'audio':state['rd']('m3_audio_settings.js'),
         'settings':state['rd']('m3_settings.js'),
         'scripts':re.findall(r'<script(?:\s[^>]*)?>([\s\S]*?)</script>',source)}
subprocess.run(['node',str(root/'tools/test_settings_combat.cjs')],input=json.dumps(payload),text=True,check=True)
print('Exact source anchors and Python syntax: PASS. Game generator / APK build: NOT RUN.')

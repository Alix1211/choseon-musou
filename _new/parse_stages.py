import re, json
HID={'하후돈':'xiahoudun','하후연':'xiahouyuan','견희':'zhenji','허저':'xuchu','장료':'zhangliao','채문희':'wenji','조비':'caopi','왕이':'wangyi','조조':'caocao',
'황개':'huanggai','태사자':'taishici','소교':'xiaoqiao','감녕':'ganning','육손':'luxun','대교':'daqiao','주유':'zhouyu','손상향':'shangxiang','손권':'sunquan',
'조운':'zhaoyun','장비':'zhangfei','관은병':'yinping','황충':'huangzhong','성채':'xingcai','마초':'machao','관우':'guanyu','월영':'yueying','제갈량':'zhugeliang','방통':'pangtong','유비':'liubei',
'화웅':'huaxiong','원술':'yuanshu','원소':'yuanshao','장각':'zhangjiao','동탁':'dongzhuo','여포':'lubu','초선':'choseon'}
plan=open('plan.md',encoding='utf8').read(); script=open('script.md',encoding='utf8').read()
st={}
# 기획서: 제목·기믹·(진입전 한 줄 대사)
cur=None
for ln in [x.strip() for x in plan.splitlines()]:
    m=re.match(r'\*\*⚔️ Stage (\d+): (.+?)\*\*',ln)
    if m:
        cur=int(m.group(1));name=m.group(2);a,_,b=name.partition(' - ')
        st[cur]={'n':cur,'t':a.strip(),'sub':b.strip(),'gm':'','plan_lines':[]};continue
    if cur is None:continue
    m=re.match(r'\*\s+\*\*맵 기믹:\*\*\s*(.+)',ln)
    if m:st[cur]['gm']=m.group(1).strip();continue
    m=re.match(r'\*\s+\*\*초선:\*\*\s*"(.+)"\s*(\(.+\))?\s*$',ln)
    if m and cur in (9,19,37,38,39):
        t=m.group(1)+((' '+m.group(2)) if m.group(2) else '');st[cur]['plan_lines'].append({'w':'choseon','t':t})
# 스크립트: 제목·대사
lines={};cur=None
for ln in script.splitlines():
    m=re.match(r'### ⚔️ Stage (\d+): (.+)',ln)
    if m:
        cur=int(m.group(1));a,_,b=m.group(2).partition(' - ')
        if cur in st:
            st[cur]['t']=a.strip();st[cur]['sub']=b.strip()
        lines[cur]=[];continue
    if cur is None:continue
    m=re.match(r'\*\s+\*\*\[(.+?)\]\*\*\s*(\(.+?\))?\s*:\s*(.+)$',ln)
    if m:
        who,note,txt=m.group(1),m.group(2),m.group(3).strip()
        w=HID.get(who) or ('npc' if who.startswith('NPC') else who)
        mm=re.match(r'^"(.*)"\s*(\(.*\))?\s*$',txt)
        if mm:txt=mm.group(1)+((' '+mm.group(2)) if mm.group(2) else '')
        d={'w':w,'t':txt}
        if note:d['note']=note.strip('()')
        lines[cur].append(d);continue
    m=re.match(r'\*\s+\*\*\((.+?)\)\*\*:\s*(.+)$',ln)
    if m:lines[cur].append({'n':1,'t':'('+m.group(1)+') '+m.group(2).strip()})
out=[]
for n in range(1,41):
    s=st[n];ids=[HID[k] for k in HID if k in s['t'] and k!='초선']
    # 순서 유지
    ids=sorted(set(ids),key=lambda i:min(s['t'].find(k) for k,v in HID.items() if v==i))
    kind='rescue' if '구출' in s['t'] else 'capture' if '포획' in s['t'] else 'entry' if ('진입' in s['t'] or n in (37,38,39)) else 'final' if n==40 else 'other'
    L=lines.get(n) or s['plan_lines']
    out.append({'n':n,'t':s['t'],'sub':s['sub'],'gm':s['gm'],'hero':ids,'kind':kind,'lines':L})
json.dump(out,open('stages.json','w'),ensure_ascii=False,indent=1)
for s in out:print(s['n'],s['kind'],s['hero'],s['t'],'|',s['sub'],'|',s['gm'][:20],'| lines',len(s['lines']))

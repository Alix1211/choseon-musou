'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const base=__dirname,dir=path.join(base,'_new');
const load=n=>fs.readFileSync(path.join(dir,n),'utf8');
const c={THEME_OF:{},KAN_SPECIAL:{}};
vm.createContext(c);
vm.runInContext(load('m3_data.js'),c);
vm.runInContext(load('m3_kan_dialogues.js'),c);
const {plans,scenes,special}=vm.runInContext('({plans:KAN_PLAN,scenes:KAN_STAGE_DIALOGUES,special:KAN_SPECIAL})',c);
let total=0;
const lines=new Set();
for(let stage=1;stage<=40;stage++){
  const n=stage===40?14:plans[stage].split(' ').length;
  assert.equal(scenes[stage].length,n-1,stage+'판 전환 횟수');
  assert.equal(Object.keys(special[stage]).length,n-1,stage+'판 특수 전환 개수');
  for(let i=1;i<n;i++){
    const scene=special[stage][i];
    assert(scene&&scene.length>0,stage+'판 '+i+'칸');
    assert.equal(scene[0][0],'choseon','초선 기본 대사 필수');
    for(const [speaker,text] of scene){
      assert(['choseon','comp'].includes(speaker),'등록된 화자');
      assert(text&&text.length>=15,'장소 상황을 설명하는 완성 문장');
      assert(!lines.has(text),'반복 문장: '+text);
      lines.add(text);
    }
    total++;
  }
}
assert.equal(total,120);
// 최종전: 6차 간부전, 7차 던전전, NPC27 절벽전까지 전용 대사.
assert.match(special[40][6][0][1],/검은 원|던전/);
assert.match(special[40][13][0][1],/절벽|NPC27/);
// 기존 시나리오 원문과 별도로 존재하는 파일을 테스트하므로 스토리 변조 없음.
console.log('PASS 40판 120장면 대사 전부 존재, 장면·화자·중복 검사');

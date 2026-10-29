/* 8판 왕이: 항아리로 비밀 문을 열고 안쪽 표식까지 이동한다. */
WEI_RULES[8]={
 init(m){const gate=weiFindGate(m);m.wei={gate,jar:{...gate.near},phase:'jar'};weiGateSet(gate,false);},
 hit(rad){const w=M.wei;if(w.phase==='jar'&&weiNear(P,w.jar,rad)){w.phase='passage';weiGateSet(w.gate,true);debris(w.jar.x,w.jar.y,30,8);showBanner('항아리가 깨지며 숨은 문이 열렸다',2.4);}},
 tick(){const w=M.wei;if(w.phase==='passage'&&weiNear(P,w.gate.far,100))weiExit('비밀 통로 돌파 · 출구 개방');},
 text(){return M.wei.phase==='jar'?'수상한 항아리를 공격하라':'숨은 길 안쪽 표식으로 이동하라';},
 target(){const w=M.wei;return w.phase==='jar'?w.jar:w.gate.far;},
 draw(){const w=M.wei;weiDrawGate(w.gate,'숨은 벽');if(w.phase==='jar'){weiMark(w.jar,'수상한 항아리','#c0a6ff');cx.save();cx.fillStyle='#9e735b';cx.beginPath();cx.ellipse(w.jar.x,w.jar.y-32,30,35,0,0,Math.PI*2);cx.fill();cx.fillStyle='#d2aa7c';cx.fillRect(w.jar.x-20,w.jar.y-72,40,12);cx.restore();}else weiMark(w.gate.far,'비밀 통로','#c0a6ff');}
};

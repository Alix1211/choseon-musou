/* 13판 소교: 벽의 숨은 장치를 찾아 비밀 통로를 연다. */
WEI_RULES[13]={
 init(m){const gate=weiFindGate(m);m.wei={gate,phase:'search',progress:0};weiGateSet(gate,false);},
 tick(dt){const w=M.wei;if(w.phase==='search'){w.progress=weiNear(P,w.gate.near,100)?w.progress+dt:0;if(w.progress>=1.5){w.phase='passage';weiGateSet(w.gate,true);showBanner('숨은 장치 발견 · 비밀 문 개방',2.4);}}else if(weiNear(P,w.gate.far,100))weiExit('비밀 통로 돌파 · 출구 개방');},
 text(){return M.wei.phase==='search'?'수상한 벽 가까이에서 숨은 장치를 찾아라':'비밀 통로 안쪽 표식으로 이동하라';},
 target(){const w=M.wei;return w.phase==='search'?w.gate.near:w.gate.far;},
 draw(){const w=M.wei;weiDrawGate(w.gate,'비밀 문');weiMark(w.phase==='search'?w.gate.near:w.gate.far,w.phase==='search'?'숨은 장치':'비밀 통로','#d2a4ff');}
};

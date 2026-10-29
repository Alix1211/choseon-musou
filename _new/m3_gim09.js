/* 9판 허창 진입: 막힌 정문을 피해 샛길로 들어가 안쪽 개폐기를 작동한다. */
WEI_RULES[9]={
 init(m){const gate=weiFindGate(m);m.wei={gate,lever:gate.far,progress:0};weiGateSet(gate,false);},
 tick(dt){const w=M.wei;w.progress=weiNear(P,w.lever,90)?w.progress+dt:0;if(w.progress>=1.5){weiGateSet(w.gate,true);weiExit('안에서 정문을 열었다 · 성문 돌파');}},
 text(){return '정문 봉쇄 · 샛길로 돌아 안쪽 개폐기를 작동하라';},
 target(){return M.wei.lever;},
 draw(){const w=M.wei;weiDrawGate(w.gate,'봉쇄된 정문');weiMark(w.lever,'안쪽 개폐기','#71dfce');cx.save();cx.fillStyle='#776b73';cx.fillRect(w.lever.x-25,w.lever.y-32,50,32);cx.strokeStyle='#bce8dc';cx.lineWidth=7;cx.beginPath();cx.moveTo(w.lever.x,w.lever.y-28);cx.lineTo(w.lever.x+18,w.lever.y-66);cx.stroke();cx.restore();}
};

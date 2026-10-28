/* ───────── 칸 구성표 · 칸 사이 대사 · 영웅 패배 대사 ───────── */
/* 칸 종류  F 들판 · W 숲길 · S 늪지 · I 설원 · V 화염지대 · C 동굴 · D 지하 감옥 · Y 성 외곽 · H 성 내부 · T 알현실
   크기     s 작게 · m 보통 · l 크게                                                                         */
const KAN_PLAN=[null,
 'Fm Ym Hm','Fm Ym Hm','Sm Cm Hm','Fm Wm Dm','Ym Hm Hm','Fm Wm Hm','Im Cm Hm','Ym Hm Hm','Fm Fm Ym','Fs Fs Ys Fs Ds Ds',
 'Vm Cm Hm','Fm Wm Dm','Fl Yl Hl','Fm Ym Hm Hm','Vm Cm Dm Dm','Im Im Ym Hm','Ym Hm Hm Hm','Fm Wm Ym Hm','Sm Ym Hm Hm','Fm Wm Dm Hm',
 'Fm Fm Cm Hm','Fm Ym Hm Hm','Cm Cm Dm Dm','Fm Wm Ym Hm','Ym Hm Hm Hm','Fm Ym Hm Hm','Fm Cm Dm Hm','Ym Hm Hm Hm','Wm Cm Ym Hm','Fm Ym Hm Hm',
 'Fm Ym Dm Hm','Fm Sm Ym Hm','Ym Hm Hm Hm','Fm Fm Ym Hm','Ym Hm Hm Hm','Fm Ym Hm Hm','Fm Fm Ym Ym','Vm Vm Ym Hm','Ym Hm Hm Dm','Fm Ym Hm Hm Tm'];
const KAN_NAME={F:'들판',W:'숲길',S:'늪지',I:'설원',V:'화염지대',C:'동굴',D:'지하 감옥',Y:'성 외곽',H:'성 내부',T:'알현실'};
const KAN_TH={S:'swamp',I:'ice',V:'volcano'};
function kanSpecs(n){
  const plan=(KAN_PLAN[n]||'Fm Ym Hm').split(' '),out=[],tot=plan.length,th0=THEME_OF[n]||'spring';
  const hN=plan.filter(q=>q[0]==='H').length,dN=plan.filter(q=>q[0]==='D').length;
  let hc=0,dc=0;
  plan.forEach((tok,i)=>{
    const t=tok[0];let nm=KAN_NAME[t];
    if(t==='H'){hc++;if(hN>1)nm+=' '+hc+'층';}
    if(t==='D'){dc++;nm=dN>1?'지하 '+dc+'층':'지하 감옥';}
    out.push({t,sz:tok[1],i,last:i===tot-1,th:KAN_TH[t]||(t==='W'&&!/spring|summer|autumn/.test(th0)?'spring':th0),nm,floor:hc});
  });
  return out;
}
/* 다음 칸으로 가는 출구 모양 */
function exitArt(a,b){
  if(b==='D')return 'down';
  if(a==='D'&&b==='H')return 'up';
  if(a==='H'&&b==='H')return 'up';
  if(b==='T')return 'door';
  if(b==='Y')return (a==='Y')?'door':'gate';
  if(b==='C')return 'cave';
  if(b==='H')return 'door';
  return 'gate';
}
/* 칸에 들어설 때 하는 말 — 초선 혼잣말 + (있으면) 합류한 장수의 한마디. 대사는 초안이다. */
const KAN_TALK={
  Y:[['choseon','저게 성문이야? 생각보다 높네. 얘들아, 문 두드릴 준비~'],['choseon','성벽 위에 활잡이들이 쫙 깔렸네. 오늘 야근 확정이야.']],
  H:[['choseon','드디어 성 안이네. 바닥이 반들반들해서 미끄러지겠어.'],['choseon','촛불에 비단 휘장까지… 적장 취향 한번 고급지네.'],['choseon','위층이 더 화려한 걸 보니, 높은 분은 위에 계시려나 봐.']],
  D:[['choseon','지하…? 으… 눅눅한 건 질색인데… 강시는 싫은데… 짜증나…'],['choseon','계단이 왜 이렇게 길어. 누가 이런 데다 사람을 가둬 놓는 거야.']],
  C:[['choseon','동굴이네… 박쥐 나오면 나 비명 지를 거야, 미리 말해둔다?'],['choseon','숨소리 같은 게 들리는데… 아냐, 바람이겠지. 바람 맞지?']],
  F:[['choseon','저기도 진영이 있네. 쉬지도 못하고 또 뛰어야 해?'],['choseon','탁 트인 데라 마음은 편한데… 적도 잘 보이겠다는 뜻이지.']],
  W:[['choseon','숲이 빽빽하네. 옷에 풀 묻으면 곤란한데.'],['choseon','나뭇가지 사이로 뭔가 번뜩인다… 매복이야, 다들 조심!']],
  S:[['choseon','늪이잖아! 발 빠지면 신발 새로 사줘야 해.'],['choseon','이 냄새… 설마 저 부글거리는 게 독기야?']],
  I:[['choseon','추워어… 바람이 소매 속으로 막 들어오는데?'],['choseon','얼음판이네. 미끄러져서 넘어지는 건 내 컨셉 아니거든.']],
  V:[['choseon','땅이 뜨끈뜨끈하다 못해 구워지겠어. 부채질 좀 해줘!'],['choseon','불꽃이 올라와… 여기서 오래 있으면 화장 다 녹겠다.']],
  T:[['choseon','여기가 제일 위층이구나. 공기부터 무겁네…'],['choseon','알현실이라니. 레드카펫 깔아놓고 기다린 거야? 반응이 빠르네.']]
};
const KAN_COMP=[ '네, 조심해서 따라가겠습니다.','맡겨 주세요, 초선 님!','…확실히 분위기가 심상치 않네요.','저도 같은 생각이에요.' ];
/* 몇몇 스테이지는 따로 쓴 대사가 있다. [칸 번호(0부터)] = [[화자,대사],…] */
const KAN_SPECIAL={
  1:{1:[['choseon','병장이 쓰러지니까 문이 열렸네. 안으로 가볼까?']]},
  3:{1:[['choseon','독기 나오는 구멍이 여기저기야… 저거 밟지 마, 다들!']]},
  10:{1:[['choseon','문이 활짝 열렸어. 마중을 나온 거야, 함정인 거야?']],3:[['choseon','어라? 없네? 어디야!!!'],['comp','지하에 가보면 어떨까요?'],['choseon','지하??? 으… 강시 싫은데… 짜증나…']]},
  40:{4:[['choseon','여기까지 왔네. 마지막 문이야. 다들, 끝까지 가자.']]}
};
/* 장수가 쓰러져 물러날 때 하는 말 (초안 — 손상향은 케인이 쓴 대사 그대로) */
const LOSS={
  shangxiang:['물러 가겠습니다..','재정비후 복귀할께요.','으악 나쁜..놈들...'],
  zhenji:['흑… 잠시 물러나 있을게요.','곧 다시 돌아올 테니 먼저 가 계세요, 초선 님.'],
  wenji:['음이… 흐트러졌어요…','조율하고 올게요. 잠깐만요!'],
  wangyi:['…들켰네. 어둠 속에서 다시 보자.','재정비하고 합류해.'],
  xiaoqiao:['꺄악! 아파아~','언니 먼저 가 있어! 금방 따라갈게!'],
  daqiao:['제가 좀… 무리했나 봐요.','잠시 쉬었다 뒤따라가겠습니다.'],
  yinping:['큭, 방심했다…!','정비하고 돌아오겠습니다. 기다려 주십시오!'],
  xingcai:['…방어가 뚫리다니.','정비 후 복귀하겠습니다.'],
  yueying:['연산 오류… 재부팅 필요!','시스템 점검 후 복귀합니다. 잠깐만요!']
};
/* 칸 종류별 몹: 요괴 비율 */
const YOKAI_P={F:0,W:.08,S:.45,I:.3,V:.4,C:1,D:.92,Y:0,H:0,T:0};

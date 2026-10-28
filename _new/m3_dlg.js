function dlgSplit(st){
  const L=st.lines||[],hasH=(st.hero||[]).length>0&&L.some(l=>!l.n&&l.w&&l.w!=='choseon');
  if(!hasH||L.length<=2)return {enc:[],mid:[],end:L};
  return {enc:[L[0]],mid:L.slice(1,L.length-1),end:[L[L.length-1]]};
}

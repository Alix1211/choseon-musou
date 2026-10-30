# Visual-only decorations. Keep the baseline terrain and collision unchanged.
rep('    m.props=genKanProps(m,L,sp);addBlocks(m);m.props.sort((a,b)=>a.y-b.y);',
    '    m.props=genKanProps(m,L,sp);addBlocks(m);m.props.sort((a,b)=>a.y-b.y);m.decors=makeDecor(m,L);')
rep('function drawProp(p){','function drawProp(p){\n  if(drawChineseFurniture(p))return;')
rep('  drawZones();drawVents();drawWards();',
    '  for(const d of (M.decors||[])){if(d.x<x0-160||d.x>x0+vw+160||d.y<y0-140||d.y>y0+vh+200)continue;const tx=Math.floor(d.x/TS),ty=Math.floor(d.y/TS);if(M.tk[ty*M.W+tx]===5)continue;draws.push({y:d.y,f:()=>decorDraw(d.key,d.x,d.y,d.w)});}\n  drawZones();drawVents();drawWards();')
rep('function drawGateLegacy(',rd('m3_decor.js')+'\nfunction drawGateLegacy(')
rep('STAGE_PROPS,propReady,PROP_NAMES};',
    'STAGE_PROPS,propReady,PROP_NAMES,DECOR_PROPS,decorReady,DECOR_NAMES,makeDecor};')

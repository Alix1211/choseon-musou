# Replace renderers only. Original functions retained as legacy for comparison.
for name in ['drawGate','drawBeacon','drawExit','weiDrawGate','drawGim05','drawGimmicks']:
 rep('function '+name+'(', 'function '+name+'Legacy(')
rep('function drawGateLegacy(',rd('m3_props.js')+'\nfunction drawGateLegacy(')
rep('get paint(){return cx},CM_AUDIO};','get paint(){return cx},CM_AUDIO,STAGE_PROPS,propReady,PROP_NAMES};')

/* Stage 40 art: never block the game or save synchronization on old APKs. */
async function stage40Timed(promise,ms){
  let timer;
  try{return await Promise.race([promise,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('timeout')),ms);})]);}
  finally{clearTimeout(timer);}
}
async function loadStage40Image(path){
  try{return await stage40Timed(loadImg(path),4500);}catch(e){}
  const url='https://raw.githubusercontent.com/Alix1211/choseon-musou/1700d406f35d90032d21f2d74a1ebbcc3a925a05/'+path;
  let cache=null,response=null;
  try{
    try{cache=await stage40Timed(caches.open('choseon-stage40-v1'),2500);
      response=await stage40Timed(cache.match(url),2500);}catch(e){}
    if(!response){
      const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),16000);
      try{response=await fetch(url,{signal:controller.signal});}
      finally{clearTimeout(timer);}
      if(!response.ok)throw Error('HTTP '+response.status);
      if(cache)cache.put(url,response.clone()).catch(()=>{});
    }
    const blob=await stage40Timed(response.blob(),10000);
    const objectURL=URL.createObjectURL(blob);
    try{return await stage40Timed(loadImg(objectURL),8000);}
    finally{URL.revokeObjectURL(objectURL);}
  }catch(error){console.warn('Stage 40 art unavailable: '+path,error);return null;}
}

(()=>{
  const modules=['01-core.js','02-records.js','02a-density.js','03-interface.js'];
  const roots=['source/','../src/app/'];
  (async()=>{
    const parts=[];
    for(const name of modules){
      let loaded=false;
      for(const root of roots){
        try{
          const response=await fetch(root+name,{cache:'no-cache'});
          if(response.ok){parts.push(await response.text());loaded=true;break;}
        }catch{}
      }
      if(!loaded) throw new Error(`Unable to load GAIA source module: ${name}`);
    }
    (0,eval)(parts.join(''));
  })().catch(error=>{
    console.error(error);
    const loading=document.querySelector('#loading');
    if(loading) loading.innerHTML='<img src="assets/gaia-seal.svg" alt=""><strong>GAIA application link unavailable</strong><span>The readable public interface could not be verified. Reload to try again.</span>';
  });
})();

(()=>{
  const modules=['01-core.js','02-records.js','02a-density.js','02b-ecology-a.js','02b-ecology-b.js','02b-ecology-c.js','02b-ecology-d.js','02c-continuity.js','02d-assets.js','02e-assurance.js','02f-release-candidate.js','02g-world-completion.js','03-interface.js'];
  const roots=['source/','../src/app/'];

  async function loadRoot(root){
    const responses=await Promise.all(modules.map(name=>fetch(root+name,{cache:'no-cache'}).catch(()=>null)));
    if(responses.some(response=>!response?.ok)) throw new Error(`GAIA source root unavailable: ${root}`);
    return Promise.all(responses.map(response=>response.text()));
  }

  (async()=>{
    let parts=null;
    for(const root of roots){
      try{parts=await loadRoot(root);break;}catch{}
    }
    if(!parts) throw new Error('Unable to load the readable GAIA source modules.');
    (0,eval)(parts.join(''));
  })().catch(error=>{
    console.error(error);
    const loading=document.querySelector('#loading');
    if(loading) loading.innerHTML='<img src="assets/gaia-seal.svg" alt=""><strong>GAIA application link unavailable</strong><span>The verified interface could not be established. Cached records may still be available after reloading.</span>';
  });
})();

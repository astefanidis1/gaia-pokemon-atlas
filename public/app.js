(()=>{
  const paths=Array.from({length:3},(_,index)=>`code/chunk-${String(index+1).padStart(2,'0')}.txt`);
  Promise.all(paths.map(async path=>{
    const response=await fetch(path,{cache:'no-cache'});
    if(!response.ok) throw new Error(`Unable to load GAIA application payload: ${path}`);
    return (await response.text()).trim();
  })).then(parts=>{
    const bytes=Uint8Array.from(atob(parts.join('')),character=>character.charCodeAt(0));
    return new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).text();
  }).then(code=>(0,eval)(code)).catch(error=>{
    console.error(error);
    const loading=document.querySelector('#loading');
    if(loading) loading.innerHTML='<img src="assets/gaia-seal.svg" alt=""><strong>GAIA application link unavailable</strong><span>The public interface could not be verified. Reload to try again.</span>';
  });
})();

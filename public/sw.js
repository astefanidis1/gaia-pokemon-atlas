const CACHE_NAME = 'gaia-shell-v1.4';
const SHELL = [
  './','index.html','styles.css','refinement.css','density.css','app.js','404.html','robots.txt',
  'assets/gaia-seal.svg',
  'data/canon.js','data/canon-corrections.json',
  'data/canon/chunk-01.txt','data/canon/chunk-02.txt','data/canon/chunk-03.txt','data/canon/chunk-04.txt','data/canon/chunk-05.txt','data/canon/chunk-06.txt','data/canon/chunk-07.txt',
  'data/editorial/chunk-01.txt','data/editorial/chunk-02.txt','data/editorial/chunk-03.txt','data/editorial/chunk-04.txt',
  'source/01-core.js','source/02-records.js','source/02a-density.js','source/03-interface.js'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => Promise.allSettled(SHELL.map(path => cache.add(path)))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('gaia-shell-') && key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  const artwork = url.hostname === 'raw.githubusercontent.com' && url.pathname.includes('/official-artwork/');
  if (artwork) {
    event.respondWith(caches.open(CACHE_NAME).then(async cache => {
      const cached = await cache.match(event.request);
      const network = fetch(event.request).then(response => { if (response.ok || response.type === 'opaque') cache.put(event.request, response.clone()); return response; }).catch(() => cached);
      return cached || network;
    }));
    return;
  }
  if (url.origin !== self.location.origin) return;
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).then(response => { const copy=response.clone(); caches.open(CACHE_NAME).then(cache=>cache.put('index.html',copy)); return response; }).catch(() => caches.match('index.html')));
    return;
  }
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => { if(response.ok) caches.open(CACHE_NAME).then(cache=>cache.put(event.request,response.clone())); return response; })));
});

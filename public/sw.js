const SHELL_CACHE = 'gaia-shell-v2.2';
const RUNTIME_CACHE = 'gaia-runtime-v1';
const ARTWORK_CACHE = 'gaia-artwork-v1';
const NAVIGATION_TIMEOUT_MS = 3500;
const SHARE_ASSETS = ['assets/gaia-social-preview.png'];
const SHELL = [
  './','index.html','offline.html','404.html','manifest.webmanifest','robots.txt',
  'styles.css','refinement.css','density.css','ecology.css','continuity.css','assets.css','assurance.css','release-candidate.css','world-completion.css','app.js',
  'assets/gaia-seal.svg','assets/gaia-icon-192.png','assets/gaia-icon-512.png','assets/gaia-icon-maskable-512.png','assets/gaia-apple-touch-icon.png',
  'data/canon.js','data/canon-corrections.json',
  'data/canon/chunk-01.txt','data/canon/chunk-02.txt','data/canon/chunk-03.txt','data/canon/chunk-04.txt','data/canon/chunk-05.txt','data/canon/chunk-06.txt','data/canon/chunk-07.txt',
  'data/editorial/chunk-01.txt','data/editorial/chunk-02.txt','data/editorial/chunk-03.txt','data/editorial/chunk-04.txt','data/editorial/phase2.txt','data/editorial/phase3-01.txt','data/editorial/phase3-02.txt','data/editorial/phase4.txt','data/editorial/phase4-02.txt',
  'source/01-core.js','source/02-records.js','source/02a-density.js','source/02b-ecology-a.js','source/02b-ecology-b.js','source/02b-ecology-c.js','source/02b-ecology-d.js','source/02c-continuity.js','source/02d-assets.js','source/02e-assurance.js','source/02f-release-candidate.js','source/02g-world-completion.js','source/03-interface.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then(cache => Promise.allSettled([...SHELL,...SHARE_ASSETS].map(path => cache.add(path))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  const current = new Set([SHELL_CACHE,RUNTIME_CACHE,ARTWORK_CACHE]);
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key.startsWith('gaia-') && !current.has(key)).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok || response.type === 'opaque') await cache.put(request,response.clone());
  return response;
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const network = fetch(request).then(async response => {
    if (response.ok || response.type === 'opaque') await cache.put(request,response.clone());
    return response;
  }).catch(() => cached);
  return cached || network;
}

async function navigate(request) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(),NAVIGATION_TIMEOUT_MS);
  try {
    const response = await fetch(request,{signal:controller.signal});
    if (response.ok) {
      const cache = await caches.open(SHELL_CACHE);
      await cache.put('index.html',response.clone());
    }
    return response;
  } catch {
    return await caches.match('index.html') || await caches.match('offline.html');
  } finally {
    clearTimeout(timer);
  }
}

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  const officialArtwork = url.hostname === 'raw.githubusercontent.com' && url.pathname.includes('/official-artwork/');
  const mapRuntime = url.hostname === 'unpkg.com' && url.pathname.includes('/maplibre-gl@');

  if (officialArtwork) {
    event.respondWith(staleWhileRevalidate(event.request,ARTWORK_CACHE));
    return;
  }
  if (mapRuntime) {
    event.respondWith(staleWhileRevalidate(event.request,RUNTIME_CACHE));
    return;
  }
  if (url.origin !== self.location.origin) return;
  if (event.request.mode === 'navigate') {
    event.respondWith(navigate(event.request));
    return;
  }
  event.respondWith(cacheFirst(event.request,SHELL_CACHE));
});

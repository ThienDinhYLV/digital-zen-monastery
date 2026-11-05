// Scope-relative service worker for GitHub Pages subpaths.
const CACHE='zen-monastery-v1.4.0';
const SCOPE=self.registration.scope;
const SHELL=[SCOPE, new URL('manifest.webmanifest',SCOPE).href, new URL('icons/icon-192.png',SCOPE).href];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(Promise.all([caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))),self.clients.claim()]));});
self.addEventListener('fetch',e=>{
 const req=e.request;if(req.method!=='GET')return;const url=new URL(req.url);
 if(url.origin!==self.location.origin||!url.href.startsWith(SCOPE)||url.pathname.includes('/api/'))return;
 if(req.mode==='navigate')e.respondWith(fetch(req).then(res=>{if(res.ok){const clone=res.clone();caches.open(CACHE).then(c=>c.put(req,clone));}return res;}).catch(()=>caches.match(req).then(r=>r||caches.match(SCOPE))));
 else e.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(res=>{if(res.ok)caches.open(CACHE).then(c=>c.put(req,res.clone()));return res;})));
});

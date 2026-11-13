/* 练记 v1.1.5：导航网络优先，离线读取本地缓存；版本查询始终访问网络。 */
const CACHE='lianji-v1.1.5';
const ASSETS=['./','./index.html','./manifest.webmanifest','./version.json','./icons/icon-192.png','./icons/icon-512.png'];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('lianji-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin)return;
  if(url.pathname.endsWith('/version.json')){
    event.respondWith(fetch(event.request,{cache:'no-store'}).catch(()=>caches.match('./version.json')));
    return;
  }
  if(event.request.mode==='navigate'){
    event.respondWith(fetch(event.request).then(res=>{
      if(res.ok){const copy=res.clone();caches.open(CACHE).then(cache=>cache.put('./index.html',copy));}
      return res;
    }).catch(()=>caches.match('./index.html').then(res=>res||Response.error())));
    return;
  }
  event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(res=>{
    if(res.ok){const copy=res.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));}
    return res;
  })));
});

const CACHE='cu-fare-v4'; // ভাড়া বা কোড বদলালে এই সংস্করণ বাড়ান
const SHELL=['./','./index.html','./manifest.json','./icons/icon-192.png','./icons/icon-512.png','./icons/apple-touch-icon.png','./icons/favicon-32.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
function put(req,res){if(res&&res.ok){const copy=res.clone();caches.open(CACHE).then(c=>c.put(req,copy))}return res}
self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.method!=='GET')return;
  const url=new URL(req.url);
  if(url.origin!==self.location.origin)return; // GoatCounter ইত্যাদি বাইরের অনুরোধে হস্তক্ষেপ নয়
  if(req.mode==='navigate'||url.pathname.endsWith('.html')){
    // HTML: আগে নেটওয়ার্ক (নতুন ভাড়া সাথে সাথে আসবে), না পেলে ক্যাশ
    e.respondWith(fetch(req).then(r=>put(req,r)).catch(()=>caches.match(req).then(m=>m||caches.match('./index.html'))));
    return;
  }
  e.respondWith(caches.match(req).then(m=>m||fetch(req).then(r=>put(req,r))));
});

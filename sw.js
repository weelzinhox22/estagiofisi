const CACHE = 'fisio-clinico-v13';
const ASSETS = ['/', '/index.html', '/src/app.js', '/src/version.js', '/src/store.js', '/src/clinical-data.js', '/src/reference-data.js', '/src/general-physio-data.js', '/src/general-physio-ui.js', '/src/clinical-reasoning-data.js', '/src/clinical-reasoning-ui.js', '/src/gait-assessment.js', '/src/clinical-workflow.js', '/src/patient-workflow-ui.js', '/src/session-workflow-ui.js', '/src/v06-data.js', '/src/v06-core.js', '/src/v06-ui.js', '/src/assessment-measures-data.js', '/src/assessment-assistant.js', '/src/assessment-assistant-ui.js', '/src/voice-dictation.js', '/src/voice-structure.js', '/src/supabase-client.js', '/src/cloud-sync.js', '/src/auth-ui.js', '/src/admin-ui.js', '/src/rapid-care-ui.js', '/src/clinical-mentor-ui.js', '/src/learning-lab-ui.js', '/src/camera.js', '/src/styles.css', '/src/assessment-assistant.css', '/src/voice-dictation.css', '/src/account-cloud.css', '/src/mobile-first.css', '/manifest.webmanifest', '/icons/icon.svg', '/icons/icon-192.png', '/icons/icon-512.png'];
self.addEventListener('install', event => { event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS))); });
self.addEventListener('message',event=>{if(event.data?.type==='SKIP_WAITING')self.skipWaiting();});
self.addEventListener('activate', event => { event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(fetch(event.request).then(response => {
    if (response.ok) { const copy = response.clone(); caches.open(CACHE).then(cache => cache.put(event.request, copy)); }
    return response;
  }).catch(() => caches.match(event.request).then(cached => cached || (event.request.mode === 'navigate' ? caches.match('/index.html') : Response.error()))));
});


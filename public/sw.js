/* PWA: 최소 서비스 워커 (설치 배너 노출용) */
self.addEventListener('install', () => {
  self.skipWaiting();
});
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

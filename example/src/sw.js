importScripts(
  "https://storage.googleapis.com/workbox-cdn/releases/3.0.0-alpha.5/workbox-sw.js"
);


workbox.clientsClaim();
workbox.skipWaiting();

workbox.precaching.precacheAndRoute([]);

workbox.routing.registerNavigationRoute("__PUBLIC/index.html");

workbox.routing.registerRoute(/http:\/\/cors-anywhere.herokuapp.com\/http:\/\/tycho.usno.navy.mil\/cgi-bin\/time.pl/i,workbox.strategies.networkFirst());
workbox.routing.registerRoute("https://cdn.rawgit.com/parcel-bundler/website/01a1f7dd/src/assets/parcel%403x.png", workbox.strategies.cacheFirst());


// Exmaple:
// const articleHandler = workbox.strategies.networkFirst({
//   cacheName: 'articles-cache',
//   cacheExpiration: {
//     maxEntries: 50
//   }
// });
//
// workbox.router.registerRoute('/pages/article*.html', args => {
//   return articleHandler.handle(args).then(response => {
//     if (!response) {
//       return caches.match('pages/offline.html');
//     } else if (response.status === 404) {
//       return caches.match('pages/404.html');
//     }
//     return response;
//   });
// });

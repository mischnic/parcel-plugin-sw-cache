importScripts(
  'https://storage.googleapis.com/workbox-cdn/releases/3.6.3/workbox-sw.js'
)

workbox.core.setCacheNameDetails({ prefix: 'custom-cache-v1' })

workbox.precaching.suppressWarnings()
workbox.precaching.precacheAndRoute([
  {
    "url": "index.html",
    "revision": "d41d8cd98f00b204e9800998ecf8427e"
  },
  {
    "url": "/",
    "revision": "74be16979710d4c4e7c6647856088456"
  }
])

workbox.routing.registerNavigationRoute('/index.html')

self.addEventListener('message', event => {
  if (!event.data) return
  switch (event.data) {
    case 'skipWaiting':
      self.skipWaiting()
      break
    default:
      break
  }
})
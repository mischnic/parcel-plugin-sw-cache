importScripts(
  'https://storage.googleapis.com/workbox-cdn/releases/3.6.3/workbox-sw.js'
)

workbox.core.setCacheNameDetails({ prefix: 'custom-cache-v1' })

workbox.precaching.suppressWarnings()
workbox.precaching.precacheAndRoute([
  {
    "url": "index.html",
    "revision": "c83301425b2ad1d496473a5ff3d9ecca"
  },
  {
    "url": "/",
    "revision": "075306287cb1f350fdfb49e376bc0a7f"
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
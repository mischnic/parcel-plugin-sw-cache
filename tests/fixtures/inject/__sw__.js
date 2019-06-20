importScripts\(
  'https:\/\/storage\.googleapis\.com\/workbox-cdn\/releases\/[0-9]\.[0-9]\.[0-9]\/workbox-sw.js'
\)

workbox\.core\.setCacheNameDetails\(\{ prefix: 'custom-cache-v1' \}\)

workbox\.precaching\.suppressWarnings\(\)
workbox\.precaching\.precacheAndRoute\(\[
  \{
    "url": "index.html",
    "revision": "[a-f0-9]+"
  \},
  \{
    "url": "\/",
    "revision": "[a-f0-9]+"
  \}
\]\)

workbox.routing.registerNavigationRoute\('\/index.html'\)

self\.addEventListener\('message', event => \{
  if \(!event\.data\) return
  switch \(event\.data\) \{
    case 'skipWaiting':
      self\.skipWaiting\(\)
      break
    default:
      break
  \}
\}\)
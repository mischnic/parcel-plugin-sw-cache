\/\*\*
 \* Welcome to your Workbox-powered service worker!
 \*
 \* You'll need to register this file in your web app and you should
 \* disable HTTP caching for this file too\.
 \* See https:\/\/goo\.gl\/nhQhGp
 \*
 \* The rest of the code is auto-generated\. Please don't update this file
 \* directly; instead, make changes to your Workbox build configuration
 \* and re-run your build process\.
 \* See https:\/\/goo\.gl\/2aRDsh
 \*\/

importScripts\("https:\/\/storage\.googleapis\.com\/workbox-cdn\/releases\/[0-9]\.[0-9]\.[0-9]\/workbox-sw.js"\);

workbox\.skipWaiting\(\);
workbox\.clientsClaim\(\);

\/\*\*
 \* The workboxSW\.precacheAndRoute\(\) method efficiently caches and responds to
 \* requests for URLs in the manifest\.
 \* See https:\/\/goo\.gl\/S9QRab
 \*\/
self\.__precacheManifest = \[
  {
    "url": "index\.html",
    "revision": "[a-f0-9]+"
  },
  {
    "url": "page\.html",
    "revision": "[a-f0-9]+"
  },
  {
    "url": "\/",
    "revision": "[a-f0-9]+"
  }
\]\.concat\(self\.__precacheManifest \|\| \[\]\);
workbox\.precaching\.suppressWarnings\(\);
workbox\.precaching\.precacheAndRoute\(self\.__precacheManifest, {}\);

workbox\.routing\.registerNavigationRoute\("\/index\.html"\);

workbox\.routing\.registerRoute\(\/https:\\\/\\\/cors-anywhere\.herokuapp\.com\\\/https:\\\/\\\/www\.unixtimestamp\.com\/, workbox\.strategies\.networkFirst\(\), 'GET'\);
workbox\.routing\.registerRoute\("https:\/\/raw\.githubusercontent\.com\/parcel-bundler\/website\/01a1f7dd\/src\/assets\/parcel@3x\.png", workbox\.strategies\.cacheFirst\({ plugins: \[new workbox\.cacheableResponse\.Plugin\({"statuses":\[0\]}\)\] }\), 'GET'\);
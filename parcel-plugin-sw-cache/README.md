# Parcel plugin for sw-caching

A [Parcel](https://parceljs.org/) plugin to run [workbox-build](https://github.com/GoogleChrome/workbox) after every build.

```sh
yarn add -D parcel-plugin-sw-cache
# or
npm install -D parcel-plugin-sw-cache
```

The plugin is configured using the `cache` object inside `package.json` of your project. ([Example](example/package.json)).
Configuration keys used by the plugin (default options first):
```js
{
    "dependencies": {
        // ...
    },
    //...
    "cache": {
        "disablePlugin": false || true,
        "inDev": false || true,
        "strategy": "default" || "inject"
        "clearDist": true || false
    }
    //...
}
```

The remaining properties in this object will be passed to `generateSW` or `injectManifest` (depending on `strategy`). See https://developers.google.com/web/tools/workbox/reference-docs/latest/module-workbox-build

In `inject` mode, occurences of  `__PUBLIC` will be replaced with Parcel's public-url option. In this case, `swSrc` is also a required parameter.

No configuration options are mandatory, the default configuration will work just fine. (Creating a service worker to precache all files in the output directory without runtime caching). With `strategy: "default"`, the default parameters passed to workbox-build are (which precaching all html, js, css, jpg and png files):
```js
{
    globDirectory: outDir,
    globPatterns: ["**/*.{html,js,css,jpg,png}"],
    swDest: swDest,
    navigateFallback: publicURL + "/index.html",
    clientsClaim: true,
    skipWaiting: true,
    templatedURLs: {
        "/": ["index.html"]
    }
}
```
and with `inject`:
```js
{
    globDirectory: outDir,
    globPatterns: [
        "**/*.{html,js,css,jpg,png,gif,svg,eot,ttf,woff,woff2}"
    ],
    swDest: swDest,
    templatedURLs: {
        "/": ["index.html"]
    }
}
```

To specify a RegExp, use an array instead (`ignoreURLParametersMatching`, `navigateFallbackWhitelist`, `runtimeCaching.urlPattern`, `injectionPointRegexp`).
```js
runtimeCaching: [
    {
        urlPattern: /my-match\/api\.[0-9]+/i
    }
]
```
becomes
```json
"runtimeCaching": [
    {
        "urlPattern": ["my-match\/api\\.[0-9]+", "i"]
    }
]
```

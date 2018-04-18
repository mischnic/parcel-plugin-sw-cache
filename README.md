# Parcel plugin for sw-caching

**This is using workbox v3, which might contain bugs**

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
    "name": "Some app",
    //...
    "cache": {
        "disablePlugin": false || true,
        "inDev": false || true,
        "strategy": "default" || "inject"
    }
    //...
}
```

The remaining properties in this object will be passed to `generateSW` or `injectManifest` (depending on `strategy`). See https://developers.google.com/web/tools/workbox/reference-docs/prerelease/module-workbox-build#.Configuration

No configuration options are mandatory, the default configuration wil work just fine. (Creating a service worker to precache all files in the output directory without runtime caching). For the default parameters passed to workbox-build see [here](index.js) (i.e. precaching all html, js, css, jpg and png files).

To specify a RegExp, use an array instead (`ignoreUrlParametersMatching`, `navigateFallbackWhitelist`, `runtimeCaching.urlPattern`).
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
        "urlPattern": ["my-match\/api\.[0-9]+", "i"]
    }
]
```

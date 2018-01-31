# Parcel plugin for sw-caching

**This is using workbox v3, which might contain bugs**

A [Parcel](https://parceljs.org/) plugin to run [workbox-build](https://github.com/GoogleChrome/workbox) after every build.

The plugin is configured using the `cache` object inside `package.json` of your project. ([Example](example/package.json)).
Configuration keys used by the plugin (default options first):
```javascript
{
    "name": "Some app",
    //...
    "cache": {
        "disablePlugin": false || true,
        "prodOnly": true || false,
        "strategy": "default" || "inject"
    }
    //...
}
```

The remaining properties in this object will be passed to `generateSW` or `injectManifest` (depending on `strategy`). See https://developers.google.com/web/tools/workbox/reference-docs/prerelease/module-workbox-build#.Configuration

No configuration options are mandatory, the default configuration wil work just fine. (Creating a service worker to precache all files in the output directory without runtime caching). For the default parameters passed to workbox-build see [here](index.js) (i.e. precaching all html, js, css, jpg and png files).
# Example project

Swap `cache` and `_cache` in `package.json` to change from:
- creating a completely new service worker which precaches the files in the parcel output dir

to

- *inject* the precache filelist into the service worker template at `src/sw.js`
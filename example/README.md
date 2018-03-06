# Example project

In your browser, you need to open [http://localhost:1234/index.html](http://localhost:1234/index.html) !!

Swap `cache` and `_cache` in `package.json` to change from:

- creating a completely new service worker which precaches the files in the parcel output dir

to

- injecting the precache filelist into the service worker template at `src/sw.js`

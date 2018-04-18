const path = require('path');
const fs = require('fs');
const workbox = require('workbox-build');
const replace = require('replace-in-file');

const supportsEmoji = process.platform !== 'win32' || process.env.TERM === 'xterm-256color';
const icon = supportsEmoji ? "👷 " : "";
const print = (...x) => console.log(icon, ...x);
const printErr = (...x) => console.error(icon, ...x);

function fixRegexpArray(arr, key){
	if(arr[key]){
		for(let i = 0; i < arr[key].length; i++){
			const val = arr[key][i];
			if(Array.isArray(val)){
				arr[key][i] = new RegExp(val[0], val[1]);
			}
		}
	}
}

module.exports = (bundler) => {

	const outDir = bundler.options.outDir;
	const publicURL = bundler.options.publicURL;
	const swDest = path.join(outDir,'sw.js');



	bundler.on('bundled', (bundle) => {
		// const config = JSON.parse(fs.readFileSync(path.join(path.dirname(bundler.options.cacheDir), "package.json"))||"{}").cache || {};
		const config = bundle.entryAsset.package.cache;

		if(config.disablePlugin) return;

		if(process.env.NODE_ENV === "development" && !config.inDev){
			if(fs.existsSync(swDest)){
				fs.unlinkSync(swDest);
			}
			return;
		}

		const swConfig = Object.assign({}, config);
		delete swConfig.strategy;
		delete swConfig.inDev;


		Object.keys(swConfig).forEach(function(key) {
			if(swConfig[key] === "undefined"){
				swConfig[key] = undefined;
			}
		});

		fixRegexpArray(swConfig, "ignoreUrlParametersMatching");
		fixRegexpArray(swConfig, "navigateFallbackWhitelist");

		if(config.strategy === "inject"){
			if(swConfig.swSrc){
				swConfig.swSrc = path.resolve(swConfig.swSrc);
			} else {
				printErr("sw-cache: swSrc missing in config")
				return;
			}

			workbox.injectManifest(Object.assign({
				globDirectory: outDir,
				globPatterns: ['**\/*.{html,js,css,jpg,png,gif,svg,eot,ttf,woff,woff2}'],
				swDest: swDest,
				templatedUrls: {
					"/": ["index.html"]
				}
			}, swConfig))
			.then(()=>
				replace({
					files: swDest,
					from: /__PUBLIC/g,
					to: publicURL
				})
			).then(()=>
				printErr("sw-cache: Service worker injection completed.")
			).catch((error) => 
				printErr("sw-cache: Service worker injection failed: " + error)
			);
		// } else if(strategy === "custom"){
			// const bundleName = bundle.name;
			// console.log(bundler.options);
			// const jss = [];
			// for(f of bundle.childBundles){
			// 	jss.push(f);
			// }
			// console.log(jss[0].name.substr(bundleName.length));
		} else {
			if(swConfig.runtimeCaching){
				for(let i = 0; i < swConfig.runtimeCaching.length; i++){
					const val = swConfig.runtimeCaching[i].urlPattern;
					if(Array.isArray(val)){
						swConfig.runtimeCaching[i].urlPattern = new RegExp(val[0], val[1]);
					}
				}
			}
			
			//handle case where public path is equal to '/'
			// indexPath is used in generateSW
			let indexPath = '/index.html';
                          if(publicURL === '/'){			  	  
                          indexPath = 'index.html'
                        }

			workbox.generateSW(
				Object.assign({
					globDirectory: outDir,
					globPatterns: ['**\/*.{html,js,css,jpg,png}'],
					swDest: swDest,
					navigateFallback: publicURL + indexPath,
					clientsClaim: true,
					skipWaiting: true,
					"templatedUrls": {
						"/": ["index.html"]
					}

					// navigate fallback: needed? dist
					// remove prefix dist or build

				}, swConfig)
				)
			.then(() => {
				print("sw-cache: Service worker generation completed.");
			}).catch((error) => {
				printErr("sw-cache: Service worker generation failed: " + error);
			});
		}

	});
};

const path = require('path');
const fs = require('fs');
const workbox = require('workbox-build');
const replace = require('replace-in-file');

module.exports = (bundler) => {

	const logger = bundler.logger;
	const outDir = bundler.options.outDir;
	const publicURL = bundler.options.publicURL;


	bundler.on('bundled', (bundle) => {
		const config = JSON.parse(fs.readFileSync(path.join(path.dirname(bundler.options.cacheDir), "package.json"))||"{}").cache;

		if(config.disablePlugin) return;

		if(process.env.NODE_ENV === "development"){
			if(typeof config.prodOnly === "undefined" ? true : config.prodOnly){
				return;
			}
		}
		const strategy = config.strategy;
		delete config.strategy;
		delete config.prodOnly;


		Object.keys(config).forEach(function(key) {
			if(config[key] === "undefined"){
				config[key] = undefined;
			}
		});

		if(strategy === "inject"){
			if(config.swSrc){
				config.swSrc = path.resolve(config.swSrc);
			} else {
				logger.error("sw-cache: swSrc missing in config")
				return;
			}
			const swDest = path.join(outDir,'sw.js');

			workbox.injectManifest(Object.assign({
				globDirectory: outDir,
				globPatterns: ['**\/*.{html,js,css,jpg,png}'],
				swDest: swDest,
				templatedUrls: {
					"/": ["index.html"]
				}
			}, config))
			.then(()=>
				replace({
					files: swDest,
					from: /__PUBLIC/g,
					to: publicURL
				})
			).then(()=>
				logger.log('sw-cache: Service worker generation completed.')
			).catch((error) => 
				logger.error('sw-cache: Service worker generation failed: ' + error)
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
			if(config.runtimeCaching){
				for(let i = 0; i < config.runtimeCaching.length; i++){
					const val = config.runtimeCaching[i].urlPattern;
					if(Array.isArray(val)){
						config.runtimeCaching[i].urlPattern = new RegExp(val[0], val[1]);
					}
				}
			}

			workbox.generateSW(
				Object.assign({
					globDirectory: outDir,
					globPatterns: ['**\/*.{html,js,css,jpg,png}'],
					swDest: path.join(outDir,'/sw.js'),
					navigateFallback: publicURL+"/index.html",
					clientsClaim: true,
					skipWaiting: true,
					"templatedUrls": {
						"/": ["index.html"]
					}

					// navigate fallback: needed? dist
					// remove prefix dist or build

				}, config)
				)
			.then(() => {
				logger.log('sw-cache: Service worker generation completed.');
			}).catch((error) => {
				logger.error('sw-cache: Service worker generation failed: ' + error);
			});
		}

	});
};

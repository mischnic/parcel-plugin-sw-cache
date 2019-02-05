const path = require("path");
const fs = require("fs");
const workbox = require("workbox-build");
const replace = require("replace-in-file");

const supportsEmoji =
	process.platform !== "win32" || process.env.TERM === "xterm-256color";
const icon = supportsEmoji ? "👷 " : "";
const print = (...x) => console.log(icon, ...x);
const printErr = (...x) => console.error(icon, ...x);

function fixRegexpArray(arr, key) {
	if (arr[key]) {
		for (let i = 0; i < arr[key].length; i++) {
			const val = arr[key][i];
			if (Array.isArray(val)) {
				arr[key][i] = new RegExp(val[0], val[1]);
			}
		}
	}
}

module.exports = bundler => {
	const { outDir, logLevel } = bundler.options;
	let publicURL = bundler.options.publicURL;
	const swDest = path.join(outDir, "sw.js");

	bundler.on("bundled", bundle => {
		// const config = JSON.parse(fs.readFileSync(path.join(path.dirname(bundler.options.cacheDir), "package.json"))||"{}").cache || {};
		const entryAsset =
			bundle.entryAsset || Array.from(bundle.childBundles)[0].entryAsset;

		entryAsset.getPackage().then(package => {
			const config = Object.assign({}, package.cache);

			if (config.disablePlugin) return;

			if (config.swDest) {
				config.swDest = path.join(outDir, config.swDest);
			}

			if (process.env.NODE_ENV === "development" && !config.inDev) {
				if (fs.existsSync(config.swDest || swDest)) {
					fs.unlinkSync(config.swDest || swDest);
				}
				return;
			}

			const swConfig = Object.assign({}, config);
			delete swConfig.strategy;
			delete swConfig.inDev;

			Object.keys(swConfig).forEach(function(key) {
				if (swConfig[key] === "undefined") {
					swConfig[key] = undefined;
				}
			});

			fixRegexpArray(swConfig, "ignoreUrlParametersMatching");
			fixRegexpArray(swConfig, "navigateFallbackWhitelist");

			if (config.strategy === "inject") {
				if (swConfig.swSrc) {
					swConfig.swSrc = path.resolve(swConfig.swSrc);
				} else {
					printErr("sw-cache: swSrc missing in config");
					return;
				}

				if (swConfig.injectionPointRegexp) {
					swConfig.injectionPointRegexp = new RegExp(
						swConfig.injectionPointRegexp[0],
						swConfig.injectionPointRegexp[1]
					);
				}

				workbox
					.injectManifest(
						Object.assign(
							{
								globDirectory: outDir,
								globPatterns: [
									"**/*.{html,js,css,jpg,png,gif,svg,eot,ttf,woff,woff2}"
								],
								swDest: swDest,
								templatedUrls: {
									"/": ["index.html"]
								}
							},
							swConfig
						)
					)
					.then(() =>
						replace({
							files: config.swDest || swDest,
							from: /__PUBLIC/g,
							to: publicURL
						})
					)
					.then(() =>
						printErr(
							"sw-cache: Service worker injection completed."
						)
					)
					.catch(error =>
						printErr(
							"sw-cache: Service worker injection failed: " +
								error
						)
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
				if (swConfig.runtimeCaching) {
					for (let i = 0; i < swConfig.runtimeCaching.length; i++) {
						const val = swConfig.runtimeCaching[i].urlPattern;
						if (Array.isArray(val)) {
							swConfig.runtimeCaching[i].urlPattern = new RegExp(
								val[0],
								val[1]
							);
						}
					}
				}

				if (publicURL == "/") {
					publicURL = "";
				}

				workbox
					.generateSW(
						Object.assign(
							{
								globDirectory: outDir,
								globPatterns: ["**/*.{html,js,css,jpg,png}"],
								swDest: swDest,
								navigateFallback: publicURL + "/index.html",
								clientsClaim: true,
								skipWaiting: true,
								templatedUrls: {
									"/": ["index.html"]
								}

								// navigate fallback: needed? dist
								// remove prefix dist or build
							},
							swConfig
						)
					)
					.then(() => {
						if (logLevel > 2) {
							print(
								"sw-cache: Service worker generation completed."
							);
						}
					})
					.catch(error => {
						printErr(
							"sw-cache: Service worker generation failed: " +
								error
						);
					});
			}
		});
	});
};

const path = require("path");
const fs = require("fs");
const workbox = require("workbox-build");
const replace = require("replace-in-file");
const rimraf = require("rimraf");

const supportsEmoji =
	process.platform !== "win32" || process.env.TERM === "xterm-256color";
const icon = supportsEmoji ? "👷" : "";
const print = (...x) => console.log(icon, "parcel-plugin-sw-cache:", ...x);
const printErr = (...x) => console.error(icon, "parcel-plugin-sw-cache:", ...x);

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

function findPackageDir(dir) {
	// Find the nearest package.json file within the current node_modules folder
	const root = path.parse(dir).root;
	while (dir !== root && path.basename(dir) !== "node_modules") {
		if (fs.existsSync(path.join(dir, "package.json"))) return dir;

		dir = path.dirname(dir);
	}
	throw new Error("Couldn't find package.json!");
}

function getConfigForEntry(file) {
	const dir = path.dirname(file);
	const pkgPath = findPackageDir(dir);
	return require(path.join(pkgPath, "package.json"));
}

module.exports = bundler => {
	const { outDir, logLevel } = bundler.options;
	let publicURL = bundler.options.publicURL;
	const swDest = path.join(outDir, "sw.js");

	{
		let clearDist = true;
		const config = getConfigForEntry(bundler.entryFiles[0]).cache;
		clearDist =
			typeof config.clearDist === "boolean"
				? config.clearDist
				: clearDist;

		if (clearDist) {
			rimraf.sync(path.join(outDir, "{*,.*}"));
		}
	}

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
			delete swConfig.clearDist;
			delete swConfig.disablePlugin;

			Object.keys(swConfig).forEach(function(key) {
				if (swConfig[key] === "undefined") {
					swConfig[key] = undefined;
				}
			});

			fixRegexpArray(swConfig, "ignoreURLParametersMatching");
			fixRegexpArray(swConfig, "navigateFallbackWhitelist");

			if (config.strategy === "inject") {
				if (!swConfig.swSrc) {
					printErr("swSrc missing in config");
					return;
				}

				try {
					swConfig.swSrc = path.resolve(
						findPackageDir(path.dirname(entryAsset.name)),
						swConfig.swSrc
					);
					if (!fs.existsSync(swConfig.swSrc)) {
						throw new Error(swConfig.swSrc + " doesn't exist!");
					}
				} catch (e) {
					printErr("loading swSrc failed,", e.message);
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
								templatedURLs: {
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
					.then(
						() => {
							if (logLevel >= 3) {
								print("Service worker injection completed.");
							}
						},
						error => {
							printErr("Service worker injection failed", error);
						}
					);
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
								templatedURLs: {
									"/": ["index.html"]
								}

								// navigate fallback: needed? dist
								// remove prefix dist or build
							},
							swConfig
						)
					)
					.then(
						() => {
							if (logLevel >= 3) {
								print(
									"sw-cache: Service worker generation completed."
								);
							}
						},
						error => {
							printErr(
								"sw-cache: Service worker generation failed",
								error
							);
						}
					);
			}
		});
	});
};

const assert = require("assert");

const path = require("path");
const fs = require("fs").promises;
const Bundler = require("parcel-bundler");
const rimraf = require("rimraf");

const SwCachePlugin = require('../index')
const getPath = (...f) => path.join(__dirname, "fixtures", ...f);

const delay = t => new Promise(res => setTimeout(() => res(), t));
const bundle = async (name, entry) => {
	await rimraf.sync(getPath(name, ".dist"));
	const bundler = new Bundler([].concat(entry).map(v => getPath(name, v)), {
		publicUrl: "/",
		outDir: getPath(name, ".dist"),

		watch: false,
		cache: false,
		killWorkers: false,
		hmr: false,
		detailedReport: false,
		logLevel: 1
	});
	await SwCachePlugin(bundler);
	const bundle = await bundler.bundle();
	return bundle;
};

describe("test", function() {
	it("basic tests", async function() {
		await bundle("basic", "index.html");

		const regex = new RegExp(await fs.readFile(getPath("basic", ".sw.js")));
		await delay(100);

		const sw = await fs.readFile(
			getPath("basic", ".dist", "service-worker.js")
		);

		assert.ok(regex.test(sw.toString()), "a correct sw is generated");
	});

	it("multiple entry points", async function() {
		await bundle("multiple-entrypoints", ["index.html", "page.html"]);

		const regex = new RegExp(
			await fs.readFile(getPath("multiple-entrypoints", ".sw.js"))
		);
		await delay(100);

		const sw = await fs.readFile(
			getPath("multiple-entrypoints", ".dist", "service-worker.js")
		);

		assert.ok(regex.test(sw.toString()), "a correct sw is generated");
	});
});

// "precache added assets"

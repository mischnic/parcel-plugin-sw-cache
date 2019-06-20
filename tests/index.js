const assert = require("assert");

const path = require("path");
const fs = require("fs").promises;
const Bundler = require("parcel-bundler");

const getPath = (...f) => path.join(__dirname, "fixtures", ...f);

const delay = t => new Promise(res => setTimeout(() => res(), t));
const bundle = async (name, entry) => {
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
	const bundle = await bundler.bundle();
	return bundle;
};

describe("test", function() {
	it("basic tests", async function() {
		const swPath = getPath("basic", ".dist", "service-worker.js");
		try {
			await fs.unlink(swPath);
		} catch (e) {}
		await bundle("basic", "index.html");

		const regex = new RegExp(await fs.readFile(getPath("basic", ".sw.js")));
		await delay(100);

		const sw = await fs.readFile(swPath);

		assert.ok(regex.test(sw.toString()), "a correct sw is generated");
	});

	it("basic tests with src directory", async function() {
		const swPath = getPath("srcdir", ".dist", "service-worker.js");
		try {
			await fs.unlink(swPath);
		} catch (e) {}
		await bundle("srcdir", "src/index.html");

		const regex = new RegExp(
			await fs.readFile(getPath("srcdir", ".sw.js"))
		);
		await delay(100);

		const sw = await fs.readFile(swPath);

		assert.ok(regex.test(sw.toString()), "a correct sw is generated");
	});

	it("multiple entry points", async function() {
		const swPath = getPath(
			"multiple-entrypoints",
			".dist",
			"service-worker.js"
		);
		try {
			await fs.unlink(swPath);
		} catch (e) {}
		await bundle("multiple-entrypoints", ["index.html", "page.html"]);

		const regex = new RegExp(
			await fs.readFile(getPath("multiple-entrypoints", ".sw.js"))
		);
		await delay(100);

		const sw = await fs.readFile(swPath);

		assert.ok(regex.test(sw.toString()), "a correct sw is generated");
	});

	it("supports inject mode", async function() {
		const swPath = getPath("inject", ".dist", "service-worker.js");
		try {
			await fs.unlink(swPath);
		} catch (e) {}
		const folder = "inject";
		const [bundleResult, expected] = await Promise.all([
			bundle(folder, "index.html"),
			fs.readFile(getPath(folder, ".sw.js"))
		]);
		await delay(100);
		const sw = await fs.readFile(swPath);
		assert.equal(
			sw.toString(),
			expected.toString(),
			"a correct injected sw is generated"
		);
	});
});

// "precache added assets"

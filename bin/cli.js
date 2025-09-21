#!/usr/bin/env node
const { default: cli } = require("../dist/cli/cli.js");
const mod = require("../dist/cli/setup.js");
const run = mod && (mod.default || mod);

Promise.resolve(run()).catch((err) => {
	cli.error(err);
});

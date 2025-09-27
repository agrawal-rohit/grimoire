#!/usr/bin/env node
const { default: logger } = require("../dist/cli/logger.js");
const mod = require("../dist/index.js");
const run = mod && (mod.default || mod);

Promise.resolve(run()).catch((err) => {
	logger.error(err);
});

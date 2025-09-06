#!/usr/bin/env node
const { default: cliHelper } = require("../dist/core/cli-helper.js");
const mod = require("../dist/cli/setup.js");
const run = mod && (mod.default || mod);

Promise.resolve(run()).catch((err) => {
  cliHelper.error(err);
});

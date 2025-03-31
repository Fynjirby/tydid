#!/usr/bin/env node

process.stderr.write = function () {
  return true;
};

const { startApp } = require("../index");

startApp();

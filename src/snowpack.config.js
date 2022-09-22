let packageJson = require('./package.json');

/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {
  // root: './',
  buildOptions: {
    out: './build'
  },
  devOptions: {
    port: 5500
  },
  env: {
    version: `${packageJson.version}`
  }
};
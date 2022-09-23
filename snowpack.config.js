let packageJson = require('./package.json');
require('dotenv').config();

/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {
  root: './src',
  buildOptions: {
    out: './build'
  },
  devOptions: {
    port: 5500
  },
  optimize: {
    bundle: true,
    minify: true
  },
  env: {
    version: `Alpha v${packageJson.version}`,
    CLIENT_ID: process.env.CLIENT_ID,
    API_KEY: process.env.API_KEY,
    AUTH: process.env.AUTH
  },
  plugins: [
    '@snowpack/plugin-dotenv'
  ]
};
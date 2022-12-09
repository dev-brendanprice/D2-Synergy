let packageJson = require('./package.json');
require('dotenv').config();

// Snowpack config
/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {
  root: './src',
  buildOptions: {
    out: './build'
  },
  devOptions: {
    port: 5500
  },
  optimize: { // Disable minification until stable release
    // minify: true
  },
  env: {
    version: `Alpha v${packageJson.version}`,
    CLIENT_ID: process.env.CLIENT_ID,
    API_KEY: process.env.API_KEY,
    AUTH: process.env.AUTH,
    HOME_URL: process.env.HOME_URL
  }
};
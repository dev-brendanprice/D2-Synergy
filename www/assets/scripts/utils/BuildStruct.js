import { bountyConfigs } from './SynergyDefinitions.js';

const log = console.log.bind();

// Add default headers back, in case OAuthFlow needed a refresh
axios.defaults.headers.common = {
    "X-API-Key": "e62a8257ba2747d4b8450e7ad469785d"
};

var fubar = await axios.get('https://www.bungie.net/common/destiny2_content/json/en/DestinyInventoryItemDefinition-cb4bec6f-e2b6-4f44-8593-cfd0255b89f2.json');

log(fubar);
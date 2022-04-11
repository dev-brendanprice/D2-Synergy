import { bountyConfigs } from './SynergyDefinitions.js';

const log = console.log.bind();

var fubar = await axios.get('https://bungie.net/common/destiny2_content/json/en/DestinyInventoryItemDefinition-cb4bec6f-e2b6-4f44-8593-cfd0255b89f2.json');

log(fubar);
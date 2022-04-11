// import { bountyConfigs } from './SynergyDefinitions.js';

var log = console.log.bind(),
    struct = {
        Destination: [],
        ActivityMode: [],
        DamageType: [],
        ItemCategory: [],
        KillType: []
    },
    confs = {};

var definitions = await axios.get('https://www.bungie.net/common/destiny2_content/json/en/DestinyInventoryItemDefinition-cb4bec6f-e2b6-4f44-8593-cfd0255b89f2.json'),
    inventoryItemDefinitions = definitions.data;

Object.keys(inventoryItemDefinitions).forEach(entry => {
    if (inventoryItemDefinitions[entry].itemType===26) {
        confs[entry] = struct;
    };
});

document.getElementById('fubar').innerHTML = `${JSON.stringify(confs)}`;
log(confs);
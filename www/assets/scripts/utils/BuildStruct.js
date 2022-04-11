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

var definitionsForItems = await axios.get('https://www.bungie.net/common/destiny2_content/json/en/DestinyInventoryItemDefinition-cb4bec6f-e2b6-4f44-8593-cfd0255b89f2.json'),
    inventoryItemDefinitions = definitionsForItems.data;

Object.keys(inventoryItemDefinitions).forEach(entry => {
    if (inventoryItemDefinitions[entry].itemType===26) {
        confs[entry] = struct;
    };
});

var definitionsForVendors = await axios.get('https://bungie.net/common/destiny2_content/json/en/DestinyVendorDefinition-cb4bec6f-e2b6-4f44-8593-cfd0255b89f2.json'),
    vendorDefinitions = definitionsForVendors.data;


// document.getElementById('fubar').innerHTML = `${JSON.stringify(confs)}`;
// log(confs);
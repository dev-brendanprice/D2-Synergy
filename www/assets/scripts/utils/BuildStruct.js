import { bountyConfigs } from './SynergyDefinitions.js';

var log = console.log.bind(),
    struct = {
        DestinationHash: [],
        ActivityModeHash: [],
        DamageTypeHash: [],
        ItemCategoryHash: [],
        KillTypeHash: []
    },
    sTime = new Date();

var definitions = await axios.get('https://www.bungie.net/common/destiny2_content/json/en/DestinyInventoryItemDefinition-cb4bec6f-e2b6-4f44-8593-cfd0255b89f2.json'),
    inventoryItemDefinitions = definitions.data.Response;

for (var entry in inventoryItemDefinitions) {
    // log(definitions[entry]);
    var rt = inventoryItemDefinitions[entry];
    if (rt.itemType===26) {
        bountyConfigs[rt.itemHash] = struct;
    };
};

log(bountyConfigs);
log(`~ [${new Date() - sTime} ms]`);
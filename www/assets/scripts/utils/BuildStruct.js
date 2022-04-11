import { bountyConfigs } from './SynergyDefinitions.js';

var log = console.log.bind(),
    struct = {
        DestinationHash: [],
        ActivityModeHash: [],
        DamageTypeHash: [],
        ItemCategoryHash: [],
        KillTypeHash: []
    };

var definitions = await axios.get('https://www.bungie.net/common/destiny2_content/json/en/DestinyInventoryItemDefinition-cb4bec6f-e2b6-4f44-8593-cfd0255b89f2.json'),
    inventoryItemDefinitions = definitions.data;


const build = async () => {
    Object.keys(inventoryItemDefinitions).forEach(entry => {
        if (entry.itemType===26) {
            bountyConfigs[entry.itemHash] = struct;
        };
    });
};

(async() => {
    
    await build();
    
    // cout
    // log(definitions.data);
    // log(inventoryItemDefinitions);
    log(bountyConfigs);
});
import { excludedBountiesByVendor } from '../user.js';
import { VendorHashesByLabel, progressionItemGroupTypes } from './SynergyDefinitions.js';
import { stringMatchProgressionItem } from './StringMatchProgressionItem.js';
import { ReplaceStringVariables } from './ReplaceStringVariables.js';

// Sort items into bounties
// @array {charInventory}, @object {charObjectives}, @object {itemDefintiions}
export function ParseBounties(charInventory, charObjectives, itemDefinitions) {

    let charBounties = [], 
        amountOfBounties = 0,
        returnObject = {};

    charInventory.forEach(bounty => {

        let item = itemDefinitions[bounty.itemHash];
        if (item.itemType === 26) {

            // Find the bounties origin vendor
            item.inventory.stackUniqueLabel.split('.').forEach(labelSubString => {

                if (Object.keys(VendorHashesByLabel).includes(labelSubString)) {
                    // Add the vendor, and the bounties, to the object
                    if (!excludedBountiesByVendor[labelSubString]) {
                        excludedBountiesByVendor[labelSubString] = [];
                    };
                    excludedBountiesByVendor[labelSubString].push(item.hash);
                };
            });

            // Add objectives to item
            item.progress = [];
            for (let objective of charObjectives[bounty.itemInstanceId].objectives) {
                item.progress.push(objective);
            };

            // Replace string variables in item descriptor
            item.displayProperties.description = ReplaceStringVariables(item.displayProperties.description);

            // Add isExpired property
            item.isExpired = new Date(bounty.expirationDate) < new Date();

            // Add item properties (props)
            item.props = [];
            item.props = stringMatchProgressionItem(item);

            // Add isComplete property
            let entriesAmount = item.progress.length, 
                entriesCount = 0;

            for (let objective of item.progress) {
                if (objective.complete) {
                    entriesCount++;
                };
            };

            // Set isComplete to true if the counted amount and length is the same (false by default)
            item.isComplete = false;
            if (entriesAmount === entriesCount) {
                item.isComplete = true;
            };

            /*
                Set isRepeatable to false if the stackUniqueLabel includes 'repeatable'
                This won't work correctly as stackUniqueLabel has no standardized format that it follows

                Repeatable bounties almost always state the *group type via the itemTypeDisplayName.
                  *Group type (crucible, gunsmith, vanguard, etc)
                Daily bounties almost always state the group type via the displayProperties.description
                This is why we are making this check to ensure the item has its group type present in props

                // Pending on deletion or refactor/re-use
            */
            if (item.inventory.stackUniqueLabel.includes('repeatable')) {

                // Add bounty group type to item.props
                item.isRepetable = true;
                // item.props.push(item.itemTypeDisplayName.split(' ')[0]);
            }
            else {
                
                item.isRepetable = false;

                // // Add bounty group type to item.props
                // let itemGroupTypes = progressionItemGroupTypes.map(v => v.toLowerCase());
                // let stackUniqueLabel = item.inventory.stackUniqueLabel.split('.');
                // let groupTypeProps = [];

                // itemGroupTypes.forEach(v => {
                //     if (stackUniqueLabel.includes(v)) {
                //         groupTypeProps.push(v);
                //     };
                // });

                // if (groupTypeProps.length > 0) {
                //     item.props.push(groupTypeProps);
                // };
            };

            // Push bounty item to charBounties and increment amountOfBounties
            charBounties.push(item);
            amountOfBounties++;
        };
    });
    
    returnObject.charBounties = charBounties;
    returnObject.amountOfBounties = amountOfBounties;
    return returnObject;
};
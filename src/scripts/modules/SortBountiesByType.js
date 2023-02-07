import { itemTypeKeys } from './SynergyDefinitions.js';

// Sorts by index of item in itemTypeKeys
// @array {a}, @object {b}
export function SortBountiesByType(a, b) {

    let firstStackUniqueLabel = a.inventory.stackUniqueLabel;
    let secondStackUniqueLabel = b.inventory.stackUniqueLabel;
    let bountyTypeA;
    let bountyTypeB;


    // Remove numbers from substring that we got from stackUniqueLabel
    // banshee44 is not acceptable so we strip it to banshee for example (not a valid use-case ofc)
    firstStackUniqueLabel.split('.').forEach(v => {

        let cleanStackUniqueLabel = v.replace(/[0-9]/g, '');
        if (itemTypeKeys.includes(cleanStackUniqueLabel)) {
            bountyTypeA = cleanStackUniqueLabel;
        };
    });

    secondStackUniqueLabel.split('.').forEach(v => {

        let cleanStackUniqueLabel = v.replace(/[0-9]/g, '');
        if (itemTypeKeys.includes(cleanStackUniqueLabel)) {
            bountyTypeB = cleanStackUniqueLabel;
        };
    });


    // Sort items by comparing indexes based on where the bountyType is in itemTypeKeys
    // weekly, daily, repeatable (in that order)
    if (itemTypeKeys.indexOf(bountyTypeA) < itemTypeKeys.indexOf(bountyTypeB)) {
        return -1;
    };
    if (itemTypeKeys.indexOf(bountyTypeA) > itemTypeKeys.indexOf(bountyTypeB)) {
        return 1;
    };
    return 0;
};
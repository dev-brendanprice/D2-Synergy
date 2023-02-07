
// Sort bounties via vendor group
// @array {charBounties}, @array {bountyArr}, @object {vendorKeys}
export function SortByGroup(charBounties, bountyArr, vendorKeys) {

    charBounties.forEach(v => {

        for (let i = 1; i < vendorKeys.length; i++) {

            if (vendorKeys.length - 1 === i) {

                bountyArr['other'].push(v);
                break;
            }
            else if (vendorKeys.length !== i) {

                if (v.inventory.stackUniqueLabel.includes(vendorKeys[i])) {
                    bountyArr[vendorKeys[i]].push(v);
                    break;
                };
            };
        };
    });
    return bountyArr;
};
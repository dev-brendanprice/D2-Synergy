
// Sort bounties via bounty type
// @array {bountyArr}, @function {sortBountiesByType}
export function SortByType(bountyArr, sortBountiesByType) {

    Object.keys(bountyArr).forEach(v => {

        let group = bountyArr[v];

        if (group.length !== 0) {
            group.sort(sortBountiesByType);
        };
    });
    return bountyArr;
};
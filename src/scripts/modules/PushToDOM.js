import { MakeBountyElement } from './MakeBountyElement.js';

// Push bounties to DOM
// @array {bountyArr}, @int {amountOfBounties}, @function {MakeBountyElement}
export function PushToDOM(bountyArr, amountOfBounties, MakeBountyElement) {

    Object.keys(bountyArr).forEach(v => {

        let group = bountyArr[v];
        if (group.length !== 0) {
            group.forEach(item => {
                MakeBountyElement(item);
                amountOfBounties++;
            });
        };
    });
};
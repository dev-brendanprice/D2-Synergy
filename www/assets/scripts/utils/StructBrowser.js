import { userStruct } from '../user.js';

// Expose necessary variables to console
$(document).ready(function () {

    $.charBounties = (char) => {
        if (char) {
            var arr = [];
            userStruct.charBounties.forEach(v => {
                v.charId === char ? arr.push(v) : null;
            });
            return arr;
        }
        else {
            return userStruct.charBounties;
        };
    };

    $.characters = () => {
        return userStruct.characters;
    };

    $.bin = () => {
        return userStruct.bin;
    };

    $.propCounts = () => {
        return userStruct.propCounts;
    };

    $.greyOutDivs = () => {
        return userStruct.greyOutDivs;
    };
});
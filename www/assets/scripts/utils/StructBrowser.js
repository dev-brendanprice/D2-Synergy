import { userStruct } from '../user.js';

// Expose necessary variables to console
$(document).ready(function () {

    $.ust = () => {
        return userStruct;
    };

    $.charBounties = (char) => {
        if (char) {
            var arr = [];
            userStruct.charBounties.forEach(v => {
                v.charId === char ? arr.push(v) : 'Character not found';
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

    $.seasonHash = () => {
        return userStruct.seasonHash;
    };
});
import { userStruct } from '../user.js';

// Expose necessary variables to console
$(document).ready(function () {

    $.charBounties = () => {
        return userStruct.charBounties;
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
});
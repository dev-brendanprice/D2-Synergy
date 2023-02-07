
// Returns corresponding class name string using classType or vice versa
// @int {classType} @bool {isReverse}
export function ParseChar(classType, isReverse = false) {

    if (classType === 0 || classType === 'Titan') {
        if (!isReverse) {
            return 'Titan';
        };
        return 0;
    }
    else if (classType === 1 || classType === 'Hunter') {
        if (!isReverse) {
            return 'Hunter';
        };
        return 1;
    }
    else if (classType === 2 || classType === 'Warlock') {
        if (!isReverse) {
            return 'Warlock';
        };
        return 2;
    };
};
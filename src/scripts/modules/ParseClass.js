
// Returns corresponding class name string using classType or vice versa
// @int {classType} @bool {isReverse}
export function ParseClass(classType, isReverse = false) {

    // If isReverse then we are turning the string version of the class, back into its number form
    if (isReverse) {
        switch (classType) {
            case 'Titan':
                return 0;
            case 'Hunter':
                return 1;
            case 'Warlock':
                return 2;
        };
    };

    // Return corresponding string
    switch (classType) {
        case 0:
            return 'Titan';
        case 1:
            return 'Hunter';
        case 2:
            return 'Warlock';
    };
};
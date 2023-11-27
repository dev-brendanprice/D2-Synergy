
// Parse the raceType number (1,2,3) into a string
// @number {raceType}, @boolean {isReverse}
export function ParseRace(raceType, isReverse = false) {

    // If isRerverse then we are turning the string version of the raceType, back into its number form
    if (isReverse) {
        switch (raceType) {
            case 'Human':
                return 0;
            case 'Awoken':
                return 1;
            case 'Exo':
                return 2;
        };
    };

    // Return corresponding string
    switch (raceType) {
        case 0:
            return 'Human';
        case 1:
            return 'Awoken';
        case 2:
            return 'Exo';
    };
};

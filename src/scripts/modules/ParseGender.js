
// Returns corresponding class name string using classType or vice versa
// @int {classType} @bool {isReverse}
export function ParseGender(genderType, isReverse = false) {

    // If isReverse then we are turning the string version of the class, back into its number form
    if (isReverse) {
        switch (genderType) {
            case 'Male':
                return 0;
            case 'Female':
                return 1;
        };
    };

    // Return corresponding string
    switch (genderType) {
        case 0:
            return 'Male';
        case 1:
            return 'Female';
    };
};
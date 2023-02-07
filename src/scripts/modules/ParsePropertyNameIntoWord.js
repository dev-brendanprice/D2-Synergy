
// Turn property name into a readable name (without the spaces)
// @string {propertyName}, @boolean {isReverse}
export function ParsePropertyNameIntoWord(propertyName, isReverse = false) {

    // Remove spaces (regex good - fight me)
    if (isReverse) {
        return propertyName.replace(/\s/g, '');
    };

    // Otherwise add spaces before capital letters
    let wordsWithoutSpaces = propertyName.match(/[A-Z][a-z]+/g);
    let string;

    // Check for invalid input (no capitalized words without spaces)
    if (!wordsWithoutSpaces) {
        return propertyName;
    };

    // Manually add spaces
    for (const index in wordsWithoutSpaces) {

        if (string === undefined) {
            string = `${wordsWithoutSpaces[index]}`;
        }
        else if (string !== undefined) {
            string = `${string} ${wordsWithoutSpaces[index]}`;
        };
    };

    return string;
};
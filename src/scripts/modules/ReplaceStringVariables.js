import { UserProfile } from '../user.js';

// Replace string variables
// @str {descriptor}
export function ReplaceStringVariables(descriptor) {

    // Find all indices of string variables
    let indices = [];
    for (let i=0; i<descriptor.length; i++) {
        if (descriptor[i] === '{' || descriptor[i] === '}') {
            indices.push(i);
        };
    };

    // Ensure indices is in ascending order
    indices.sort((a,b) => a-b);
    
    // Loop over indices with counted for loop
    for (let i=0; i<indices.length; i++) {

        // Get the string variable id
        let variableId = descriptor.slice(indices[i+1], indices[i]).split(':')[1];
        if (variableId) {
            
            // Check in profile and character contexts for string variables
            let variableValue;
            if (UserProfile.destinyUserProfile.profileStringVariables.data.integerValuesByHash[variableId]) {
                variableValue = UserProfile.destinyUserProfile.profileStringVariables.data.integerValuesByHash[variableId];
            }
            else {
                variableValue = UserProfile.destinyUserProfile.characterStringVariables.data[currentCharId].integerValuesByHash[variableId];
            };

            // Splice variable value back into string
            let subString = descriptor.substring(indices[i-1], indices[i]+1, variableValue);
            descriptor = descriptor.replace(subString, variableValue);
        };
    };

    return descriptor;
};
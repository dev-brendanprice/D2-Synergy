import { log } from '../user.js';

/*

    This needs to be re-done because it doesn't work
    - When assigning the innerHTML string back into itself, the content disappears
    - When iterating over more than one indice of [], it tends to re-use the previous indexes

*/

// Replace named string variables: [Melee] in a string will be replaced with a melee icon
// @str {descriptor}
export function ReplaceNamedStringVariables(descriptor) {

    // Find all indices of named string variables
    let indices = [];
    for (let i=0; i<descriptor.length; i++) {
        if (descriptor[i] === '[' || descriptor[i] === ']') {
            indices.push(i);
        };
    };

    // Ensure indices is in ascending order
    indices.sort((a,b) => a-b);

    for (let i=0; i<indices.length; i++) {
        
        // Get named variable
        // let variableName = descriptor.slice(indices[i+1], indices[i]);
        let variableName = descriptor.slice(indices[i]+1, indices[i+1]);
        if (variableName) {
            
            // Ignore slices with space at the start
            if (variableName.charAt(0) !== ' ') {

                // Get the indexes for the range to replace in variable name
                let variableNameIndexes = [indices[i], indices[i+1]];

                // Remove spaces in variable name
                variableName = variableName.replace(/\s/g, '');

                // Make image element
                let variableNameElement = `<img src="../static/ico/destiny-icons/${variableName}_icon.svg">`;

                // Splice image back into place of the named variable
                let substringToReplace = descriptor.slice(indices[i], indices[i+1]+1);
                descriptor = descriptor.replace(substringToReplace, variableNameElement);

                log(descriptor);
            };
        };
    };

    return descriptor;
};
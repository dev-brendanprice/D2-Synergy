

// Function to find all the relations between progressional items
// @obj {progressionalItems}
export async function ParseProgressionalRelations(progressionalItems) {
    
    let bountyRelations = {},
        challengeRelations = {},
        allRelations = {};
    
    // Used to find percentage
    let relationCount = 0;

    // Loop through character bounties
    for (let bounty of progressionalItems.charBounties) {
        
        // Loop through props and add to bountyRelations
        bounty.props.forEach((prop) => {

            // Check if prop exists in bountyRelations, if so add 1
            if (bountyRelations[prop]) {
                bountyRelations[prop]++;
            }
            else { // if not create it
                bountyRelations[prop] = 1;
            };
            relationCount++;
        });
    };

    // Loop through challenges
    for (let index in progressionalItems.challenges) {
        
        // Loop through challenge props
        let challenge = progressionalItems.challenges[index];
        challenge.props.forEach((prop) => {

            // Check if props exists in challengeRelations, if so add 1
            if (challengeRelations[prop]) {
                challengeRelations[prop]++;
            }
            else { // if not create it
                challengeRelations[prop] = 1;
            };
            relationCount++;
        });
    };

    // Remove keys' values that are not more than 1
    bountyRelations = Object.fromEntries(Object.entries(bountyRelations).filter(([key, value]) => value > 1));
    challengeRelations = Object.fromEntries(Object.entries(challengeRelations).filter(([key, value]) => value > 1));

    // Add relation count to table subheading
    document.getElementById('relationsTotalField').innerHTML = relationCount;

    // Merge relations
    allRelations = {...bountyRelations, ...challengeRelations};
    

    // Convert allRelations to percentages
    allRelations = Object.entries(allRelations).map(([key, value]) => {
        return [key, Math.trunc((value / relationCount) * 1000)];
    });

    // Sort allRelations by percentage
    allRelations.sort((a, b) => b[1] - a[1]);

    // Return all relations in the form of an object
    return {bounties: bountyRelations, challenges: challengeRelations, all: allRelations};
};
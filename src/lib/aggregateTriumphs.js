// returns number of profiles that completed each seal triumph
function aggregateTriumphs (profiles, destinySeals) {

    let triumphCompletions = {};
    
    // iterate over profiles, seals, and then triumphs for said seals
    for (let profile of Object.values(profiles)) {
        for (let seal of destinySeals) {
            for (let triumph of seal.children.records) {

                // has this profile completed this triumph?
                const sealFromPlayer = profile.seals.find(s => s.hash === seal.hash);
                const triumphFromPlayerSeal = sealFromPlayer.children.records.find(t => t.hash === triumph.hash);

                if (!triumphCompletions[triumph.hash]) { // doesn't exist yet
                    triumphCompletions[triumph.hash] = {
                        amountOfCompletions: 0,
                        completeProfiles: [],
                        profilesThatDidNotComplete: []
                    }
                }
                
                // if triumph is complete
                if (triumphFromPlayerSeal.isComplete) {
                    triumphCompletions[triumph.hash].amountOfCompletions++;
                    triumphCompletions[triumph.hash].completeProfiles.push(profile);
                }
                else if (!triumphFromPlayerSeal.isComplete) {
                    triumphCompletions[triumph.hash].profilesThatDidNotComplete.push(profile);
                }
            }
        }
    }
    return triumphCompletions;
}

export default aggregateTriumphs;
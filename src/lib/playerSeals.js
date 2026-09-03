import { get } from 'idb-keyval';
import CombineAllRecords from "./allRecords.js";

// get records (seal triumphs) for the specified profile
async function getPlayerSeals(memshipType, memshipId) {

    // pull required definition entries for this function
    const RecordDefinitions = await get('DestinyRecordDefinition');
    let DestinySeals = await get('DestinySeals');

    // request API for profile + character progressions
    const config = {
        method: 'GET',
        headers: {
            'X-Api-Key': import.meta.env.VITE_API_KEY
        }
    };

    const url = `https://www.bungie.net/Platform/Destiny2/${memshipType}/Profile/${memshipId}/?components=100,200,700,900`;
    const response = await fetch(url, config);
    const profile = await response.json();
    const allRecords = CombineAllRecords(profile);

    // get completion progress for each seal
    return DestinySeals.map((seal) => {

        // get completion status & set name that appears for title in-game
        seal.completion = allRecords[seal.completionRecordHash];
        seal.displayProperties.uiName =
            RecordDefinitions[seal?.completionRecordHash]?.titleInfo?.titlesByGender?.Male ||
            RecordDefinitions[seal?.completionRecordHash]?.titleInfo?.titlesByGender?.Female;

        // return if no objectives
        if (!seal?.completion?.objectives?.length) return seal;

        // get completion state for each seal triumph
        seal.children.records.map(triumph => {
            const triumphObjectives = allRecords[triumph.hash];
            if (!triumphObjectives) return;

            triumph.isTriumphComplete =
                triumphObjectives?.objectives?.every(i => i.complete) ||
                triumphObjectives?.intervalObjectives?.every(i => i.complete);
        });

        seal.completion.percentComplete = Math.trunc((seal.children.records.filter(t => t.isTriumphComplete).length /
            seal.children.records.length) * 100);
        // seal.isTitleComplete = seal.children.records.every(t => t.isTriumphComplete);
        return seal;
    });
}

export default getPlayerSeals;
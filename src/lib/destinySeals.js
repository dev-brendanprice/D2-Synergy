import { get } from 'idb-keyval';
import { UnobtainableSeals } from '../lib/manifest';

export default async function GetDestinySeals() {

    const DestinyPresentationNodeDefinition = await get('DestinyPresentationNodeDefinition');
    const DestinyRecordDefinition = await get('DestinyRecordDefinition');

    // Create a list of Destiny 2 Seals using DestinyPresentationNodeDefinition
    let seals = Object.values(DestinyPresentationNodeDefinition)
                .filter(n => n.parentNodeHashes.includes(616318467)); // check for "Titles" parent

    // translate triumphs and add title names that appear in-game (e.g. above a guardian)
    seals = seals.map(seal => {
        seal.children.records = seal?.children?.records?.map(triumph => {
            return DestinyRecordDefinition[triumph?.recordHash];
        });

        seal.displayProperties.uiName = DestinyRecordDefinition[seal?.completionRecordHash]?.titleInfo?.titlesByGender?.Male;
        seal.isObtainable = !Object.keys(UnobtainableSeals).includes((seal.hash).toString()); // seal exists here then it's unobtainable
        return seal;
    });

    return seals;
};
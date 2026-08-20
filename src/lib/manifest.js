import { set } from 'idb-keyval';
import GetDestinySeals from "./destinySeals.js";

import XboxIcon from '../assets/xbox-icon.svg';
import PSNIcon from '../assets/psn-icon.svg';
import SteamIcon from '../assets/steam-icon.svg';
import StadiaIcon from '../assets/stadia-icon.svg';
import EGSIcon from '../assets/egs-icon.svg';
import BungieIcon from '../assets/bungie-icon.svg';

export const UnobtainableSeals = Object.freeze(
    {
        3896035657: "Star Baker",
        2130405703: "Avant-Garde",
        3417748255: "Sharpshooter",
        2470605514: "Heavy Metal",
        1317417718: "Champ",
        2592822840: "Ghost Writer",
        3598951881: "Flamekeeper"
    }
);

// deprecate this?
export const PlatformTypes = Object.freeze(
    {
        0: "Unknown Platform",
        1: "Xbox",
        2: "PSN",
        3: "Steam",
        4: "Battle.net",
        5: "Stadia",
        6: "Epic Games",
        10: "TigerDemon",
        20: "GoliathGame",
        254: "Bungie",
        "-1": "All"
    }
);

export const PlatformIcons = Object.freeze(
    {
        0: "Unknown Platform",
        1: XboxIcon,
        2: PSNIcon,
        3: SteamIcon,
        4: "Battle.net",
        5: StadiaIcon,
        6: EGSIcon,
        10: "TigerDemon",
        20: "GoliathGame",
        254: BungieIcon,
        "-1": "All"
    }
);


// get and store up-to-date definitions
export async function ValidateManifest() {

    const definitionsRequired = [
        'DestinyPresentationNodeDefinition',
        'DestinyRecordDefinition'
    ];
    const requestConfig = {
        method: 'GET',
        headers: {
            'X-Api-Key': import.meta.env.VITE_KEY
        }
    };

    const res = await fetch('https://www.bungie.net/Platform/Destiny2/Manifest/', requestConfig);
    const parsed = await res.json(); // parse the response to JSON

    // return this function if stored version is same as version from above request
    const storedVersion = window.localStorage.getItem('manifestVersion');
    if (storedVersion === parsed?.Response?.version) {
        return;
    }

    console.log('manifest updating');

    // iterate over /manifest/ response and get paths for the definitions we need
    for (let defName of definitionsRequired) {

        const url = 'https://www.bungie.net' + parsed.Response?.jsonWorldComponentContentPaths?.en[defName];
        const response = await fetch(url, {method: 'GET'});
        const definitions = await response.json(); // parse this response to JSON
        await set(defName, definitions); // save definitions to idb
    }

    // store new manifest version in local storage
    window.localStorage.setItem('manifestVersion', parsed?.Response?.version);

    // get & store list of Destiny seals - easier and lighter on resources to get & save beforehand
    const seals = await GetDestinySeals();
    await set('DestinySeals', seals);
    console.log('manifest updated');
}
import axios from 'axios';
import { FetchPrimaryUserMembership } from './FetchPrimaryUserMembership.js';
import { ReturnSeasonPassLevel } from './ReturnSeasonPassLevel.js';

const log = console.log.bind(console);
const requestHeaders = { headers: { "X-API-Key": import.meta.env.API_KEY } };

export async function LoadPartialProfile(memship) {

    // Get correct memship type
    let memshipType = await FetchPrimaryUserMembership(memship)
    .then((res) => {
        return res.membershipType;
    }).catch(e => console.error(e));


    // Request definitions objects (one-off thing, does not affect user.js)
    let navlang = window.navigator.language.split('-')[0];
    let manifest = await axios.get(`https://www.bungie.net/Platform/Destiny2/Manifest/`);
    let components = manifest.data.Response.jsonWorldComponentContentPaths[navlang];

    let seasonDefinitions = await axios.get(`https://www.bungie.net${components.DestinySeasonDefinition}`);
    seasonDefinitions = seasonDefinitions.data;
    let seasonPassDefinitions = await axios.get(`https://www.bungie.net${components.DestinySeasonPassDefinition}`);
    seasonPassDefinitions = seasonPassDefinitions.data;


    // Get user clan name
    let clan = await axios.get(`https://www.bungie.net/Platform/GroupV2/User/${memshipType}/${memship}/0/1/`, requestHeaders)
    .then((res) => {
        return res.data.Response.results[0].group;
    }).catch(e => console.error(e));

    // Get user info
    let user = await axios.get(`https://www.bungie.net/Platform/Destiny2/${memshipType}/Profile/${memship}/?components=100,1400,900,202,200,104`, requestHeaders)
    .then((res) => {
        return res.data.Response;
    }).catch(e => console.error(e));
    log(user);


    // Get current season/season pass -> Get user season rank
    let season = seasonDefinitions[user.profile.data.currentSeasonHash];
    let seasonpass = seasonPassDefinitions[season.seasonPassHash];

    let seasonProgressionHash = season.seasonPassProgressionHash; // Get required progression hashes
    let prestigeSeasonProgressionHash = seasonpass.prestigeProgressionHash;

    let seasonProgression = Object.values(user.characterProgressions.data)[0].progressions[seasonProgressionHash]; // Get progression data
    let prestigeSeasonProgression = Object.values(user.characterProgressions.data)[0].progressions[prestigeSeasonProgressionHash];


    // Get all commendations values



    
    // Return all required profile info
    let pchar = Object.values(user.characters.data)[0];
    return {
        cname: clan.name,
        uname: user.profile.data.userInfo.displayName,
        displayCode: user.profile.data.userInfo.bungieGlobalDisplayNameCode,
        light: pchar.light,
        emblemBackgroundPath: pchar.emblemBackgroundPath,
        guardianRank: user.profile.data.currentGuardianRank,
        tscore: user.profileRecords.data.activeScore,
        splevel: await ReturnSeasonPassLevel(seasonProgression, prestigeSeasonProgression)
    };

};
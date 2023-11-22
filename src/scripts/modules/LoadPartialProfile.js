import axios from 'axios';
import { FetchPrimaryUserMembership } from './FetchPrimaryUserMembership.js';
import { ReturnSeasonPassLevelProgress } from './ReturnSeasonPassLevelProgress.js';

const log = console.log.bind(console);
const requestHeaders = { headers: { "X-API-Key": import.meta.env.API_KEY } };

export async function LoadPartialProfile(memship) {

    // Get correct memship type
    let memshipType = await FetchPrimaryUserMembership(memship)
    .then((res) => {
        return res.membershipType;
    }).catch(e => console.error(e));


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
    log(clan, user);
    
    // Return all required profile info
    let pchar = Object.values(user.characters.data)[0];
    return {
        cname: clan.name,
        uname: user.profile.data.userInfo.displayName,
        displayCode: user.bungieGlobalDisplayNameCode,
        light: pchar.light,
        emblemBackgroundPath: pchar.emblemBackgroundPath,
        guardianRank: user.currentGuardianRank,
        tscore: user.profileRecords.data.activeScore
    };

};
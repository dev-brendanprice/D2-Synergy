import axios from 'axios';
import { FetchPrimaryUserMembership } from './FetchPrimaryUserMembership.js';
import { ReturnSeasonPassLevel } from './ReturnSeasonPassLevel.js';
import { ParseGender } from './ParseGender.js';

const log = console.log.bind(console);
const requestHeaders = { headers: { "X-API-Key": import.meta.env.API_KEY } };

export async function LoadPartialProfile(memship, definitions) {

    // Parse defs
    const {
        seasonDefinitions,
        seasonPassDefinitions,
        commendationsNodeDefinitions,
        recordDefinitions
    } = definitions;

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

    log(user);
    // Get current season/season pass -> Get user season rank
    let pchar = Object.values(user.characters.data).sort((a,b) => new Date(b.dateLastPlayed) - new Date(a.dateLastPlayed))[0]; // Get primary character by date last played
    let season = seasonDefinitions[user.profile.data.currentSeasonHash];
    let seasonpass = seasonPassDefinitions[season.seasonPassHash];

    // Get required progression hashes
    let seasonProgressionHash = season.seasonPassProgressionHash;
    let prestigeSeasonProgressionHash = seasonpass.prestigeProgressionHash;

    // Check if profile is private by proxy
    let seasonProgression = 0;
    let prestigeSeasonProgression = 0;
    if (user.characterProgressions.data) {

        // Get progression data
        seasonProgression = Object.values(user.characterProgressions.data)[0].progressions[seasonProgressionHash];
        prestigeSeasonProgression = Object.values(user.characterProgressions.data)[0].progressions[prestigeSeasonProgressionHash];
    };


    // Get all commendation node values -> sent/received and total (w/ private profiles in mind)
    const profileComms = user.profileCommendations.data;
    const totalScore = profileComms.totalScore ? profileComms.totalScore : 0;
    const sent = profileComms.scoreDetailValues ? profileComms.scoreDetailValues[0] : 0;
    const received = profileComms.scoreDetailValues ? profileComms.scoreDetailValues[1]: 0;
    const pctsByHash = profileComms.commendationNodePercentagesByHash;
    let nodesArr = [];

    for (let nodeHash in pctsByHash) {
        
        let commendationPercent = pctsByHash[nodeHash];
        let def = commendationsNodeDefinitions[nodeHash];
        nodesArr.push([ def.displayProperties.name, commendationPercent ]);
    };


    
    // Check if a title is equipped
    let title = false;
    let gild = false;
    if (pchar.titleRecordHash) {

        // Get title and title hash
        let titleHash = pchar.titleRecordHash;
        title = recordDefinitions[titleHash];

        // Check if title can be gilded
        if (title.titleInfo.gildingTrackingRecordHash) {
            
            // Check if gild is complete
            let gildRecord = user.profileRecords.data.records[title.titleInfo.gildingTrackingRecordHash];
            if (gildRecord.objectives[0].complete) {

                // log(gildRecord);
                // log(!!(gildRecord.state & 1));

                // Check if gild has been claimed
                // let state = Boolean(gildRecord.state & 1);
                // log(gildRecord.state);
                // if (state) {
                //     gild = true;
                // };
            };
        };

        // Get title name, via character gender (localization purposes)
        let charGender = ParseGender(pchar.genderType);
        title = title.titleInfo.titlesByGender[charGender];
    };


    // Return all required profile info
    return {
        memship: memship,
        uname: user.profile.data.userInfo.bungieGlobalDisplayName,
        displayCode: user.profile.data.userInfo.bungieGlobalDisplayNameCode,
        light: pchar.light,
        emblemPath: pchar.emblemPath,
        emblemBackgroundPath: pchar.emblemBackgroundPath,
        guardianRank: user.profile.data.currentGuardianRank,
        tscore: user.profileRecords.data ? user.profileRecords.data.activeScore : 0,
        splevel: await ReturnSeasonPassLevel(seasonProgression, prestigeSeasonProgression),
        cname: clan.name,
        comms: {
            totalScore: totalScore,
            nodes: nodesArr,
            details: {
                sent: sent,
                received: received
            }
        },
        titleName: title, // If no title, return false
        isTitleGilded: gild // If no gild, return false
    };

};
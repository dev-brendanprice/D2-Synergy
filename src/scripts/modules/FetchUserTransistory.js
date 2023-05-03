import { 
    axiosHeaders, 
    UserProfile,
    UserXpModifiers,
    userTrasistoryData,
    seasonDefinitions, log } from '../user.js';
import { MakeRequest } from './MakeRequest.js';
import { GenerateRandomString } from './GenerateRandomString.js';
import { FetchPrimaryUserMembership } from './FetchPrimaryUserMembership.js';

// Fetch transistory data from current user
export async function FetchUserTransistory() {

    // Fetch config + Query params
    const membershipType = UserProfile.membershipType;
    const destinyMembershipId = UserProfile.destinyMembershipId;
    const axiosConfig = {
        headers: {
            Authorization: `Bearer ${JSON.parse(window.localStorage.getItem('accessToken')).value}`,
            "X-API-Key": `${axiosHeaders.ApiKey}`
        }
    };

    // Request user's transistory data
    await MakeRequest(`https://www.bungie.net/Platform/Destiny2/${membershipType}/Profile/${destinyMembershipId}/?components=1000&cachebust=${GenerateRandomString(12)}`, axiosConfig)
    .then( async (response) => {

        const transistoryData = response.data.Response.profileTransitoryData;
        let fireteamMembers = [];

        // Check if user is in a fireteam and store fireteam members
        if (transistoryData.data) {
            if (transistoryData.data.partyMembers.length > 1) {

                log('📚 User in a fireteam');

                // Store fireteam members
                fireteamMembers = transistoryData.data.partyMembers;

                // Exclude user from fireteam members
                fireteamMembers = fireteamMembers.filter((member) => {
                    return parseInt(member.membershipId) !== destinyMembershipId;
                });

                // Get user with highest season pass rank
                await FindHighestUser(fireteamMembers);
                return;
            };
        };

        // Else, user is not in a fireteam
        log('📚 User not in a fireteam');

    })
    .catch((error) => {
        console.error(error);
    });
};

async function FindHighestUser(fireteamMembers) {

    // Config
    let highestSeasonRankFromMembers = 0;
    const axiosConfig = {
        headers: {
            Authorization: `Bearer ${JSON.parse(window.localStorage.getItem('accessToken')).value}`,
            "X-API-Key": `${axiosHeaders.ApiKey}`
        }
    };

    // Iterate fireteam members
    for (let user of fireteamMembers) {

        let userDestinyMembershipId = user.membershipId;
        let userDestinyMembershipType;

        // Fetch the primary user profile
        const primaryUserProfile = await FetchPrimaryUserMembership(userDestinyMembershipId);
        userDestinyMembershipType = primaryUserProfile.membershipType;

        // Fetch progressions and store highest rank
        await MakeRequest(`https://www.bungie.net/Platform/Destiny2/${userDestinyMembershipType}/Profile/${userDestinyMembershipId}/?components=202`, axiosConfig)
        .then((response) => {

            let characters = response.data.Response.characterProgressions.data;
            let characterProgressions = characters[Object.keys(characters)[0]].progressions;
            let seasonProgression = characterProgressions[seasonDefinitions[UserProfile.currentSeasonHash].seasonPassProgressionHash];
            let seasonRank = seasonProgression.level;

            // Check if members season rank is higher than 100, store 100 as the highest
            if (seasonRank >= 100) {
                highestSeasonRankFromMembers = 100;
                return;
            };

            // Check if members season rank is higher than the stored rank, if so replace with current members season rank
            if (seasonRank > highestSeasonRankFromMembers) {
                highestSeasonRankFromMembers = seasonRank;
            };

        })
        .catch((error) => {
            console.error(error);
        });

        userTrasistoryData.AssignTransistoryData('highestSeasonPassRankInFireteam', highestSeasonRankFromMembers);
    };
};

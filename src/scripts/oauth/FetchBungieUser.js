import { CheckUserTokens } from './CheckUserTokens';
import { axiosHeaders, log, UserProfile, UserProfileProgressions } from '../user.js';
import { MakeRequest } from '../modules/MakeRequest';
import { FetchPrimaryUserMembership } from '../modules/FetchPrimaryUserMembership.js';

// Fetch bungie user data
// @checkTokens {boolean}
export async function FetchBungieUser(checkTokens = true) {

    log('-> FetchBungieUser Called');

    // Check user tokens, as we need to use the access token to fetch the user data
    if (checkTokens) {
        await CheckUserTokens();
    };

    // Get components
    const components = JSON.parse(window.localStorage.getItem('components'));
    const axiosConfig = {
        headers: {
            Authorization: `Bearer ${JSON.parse(window.localStorage.getItem('accessToken')).value}`,
            "X-API-Key": `${axiosHeaders.ApiKey}`
        }
    };


    // Check membershipType
    let membershipType = window.sessionStorage.getItem('membershipType');
    let destinyMembershipId = window.sessionStorage.getItem('destinyMembershipId');

    // Fetch linked profiles if memshipType or destinyMemshipId don't exist -- 254 as membershipType
    if (!membershipType || !destinyMembershipId) {

        const primaryUserProfile = await FetchPrimaryUserMembership(components.membership_id);

        // Store memship id and type
        membershipType = primaryUserProfile.membershipType;
        destinyMembershipId = primaryUserProfile.membershipId

        // Store in session storage
        window.sessionStorage.setItem('membershipType', membershipType)
        window.sessionStorage.setItem('destinyMembershipId', destinyMembershipId);
    };


    // Fetch profile
    await MakeRequest(`https://www.bungie.net/Platform/Destiny2/${membershipType}/Profile/${destinyMembershipId}/?components=100,104,200,201,202,205,300,301,305,900,1000,1200`, axiosConfig)
    .then((response) => {

        // Assign user profile and progression data
        UserProfile.AssignDestinyUserProfile(response.data.Response);
        UserProfile.AssignCharacters(response.data.Response.characters.data);
        UserProfile.AssignCurrentSeasonHash(response.data.Response.profile.data.currentSeasonHash);
        UserProfileProgressions.AssignProfileProgressions(response.data.Response.profileProgression.data);

        // Session storage
        window.sessionStorage.setItem('destinyUserProfile', JSON.stringify(response.data.Response));
    })
    .catch((error) => {
        console.error(error);
    });

    UserProfile.AssignDestinyMembershipId(destinyMembershipId);
    UserProfile.AssignMembershipType(membershipType);
    
    log(`-> FetchBungieUser Finished`);
};
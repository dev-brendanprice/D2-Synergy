// import { requestHeaders } from '../user.js';
import { MakeRequest } from "../modules/MakeRequest";
import axios from 'axios';

// Fetch bungie user data
// @destinyMembershipId {int}
export async function FetchPrimaryUserMembership(destinyMembershipId, useNormal = false) {

    // Get components/headers etc
    let primaryMembership = {};

    const requestHeaders = {
        ApiKey: import.meta.env.API_KEY,
        Authorization: import.meta.env.AUTH
    };

    if (useNormal) {

        const requestConfig = {
            headers: {
                Authorization: `Bearer ${JSON.parse(window.localStorage.getItem('accessToken')).value}`,
                "X-API-Key": `${requestHeaders.ApiKey}`
            }
        };

        // Fetch linked profiles if memshipType or destinyMemshipId don't exist -- 254 as membershipType
        await MakeRequest(`https://www.bungie.net/Platform/Destiny2/254/Profile/${destinyMembershipId}/LinkedProfiles/?getAllMemberships=true`, requestConfig)
        .then((response) => {

            // Find the most recently played on profile
            let mostRecent = new Date(0);
            let mostRecentIndex = 0;
            for (let i = 0; i < response.data.Response.profiles.length; i++) {
                if (new Date(response.data.Response.profiles[i].dateLastPlayed) > new Date(mostRecent)) {
                    mostRecent = new Date(response.data.Response.profiles[i].dateLastPlayed);
                    mostRecentIndex = i;
                };
            };

            // Store response
            primaryMembership = response.data.Response.profiles[mostRecentIndex];
        })
        .catch((error) => {
            console.error(error);
        });

    }
    else {

        const requestConfig = { headers: { "X-API-Key": `${requestHeaders.ApiKey}` }};

        // Fetch linked profiles if memshipType or destinyMemshipId don't exist -- 254 as membershipType
        await axios.get(`https://www.bungie.net/Platform/Destiny2/254/Profile/${destinyMembershipId}/LinkedProfiles/?getAllMemberships=true`, requestConfig)
        .then((response) => {

            // Find the most recently played on profile
            let mostRecent = new Date(0);
            let mostRecentIndex = 0;
            for (let i = 0; i < response.data.Response.profiles.length; i++) {
                if (new Date(response.data.Response.profiles[i].dateLastPlayed) > new Date(mostRecent)) {
                    mostRecent = new Date(response.data.Response.profiles[i].dateLastPlayed);
                    mostRecentIndex = i;
                };
            };

            // Store response
            primaryMembership = response.data.Response.profiles[mostRecentIndex];
        })
        .catch((error) => {
            console.error(error);
        });

    };

    // Return data
    return primaryMembership;
};
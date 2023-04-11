import { axiosHeaders, log } from '../user.js';
import axios from 'axios';

// Authorize with Bungie.net
// @string {authCode}
export async function AuthorizeUserWithBungie (authCode) {
    
    let AccessToken = {},
        RefreshToken = {},
        components = {},
        AuthConfig = {
            headers: {
                'X-API-Key': axiosHeaders.ApiKey,
                Authorization: `Basic ${axiosHeaders.Authorization}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        };

    // Authorize user and get credentials (first time sign-on usually)
    await axios.post('https://www.bungie.net/platform/app/oauth/token', `grant_type=authorization_code&code=${authCode}`, AuthConfig)
        .then(res => {

            let data = res.data;

            // Store components
            components['membership_id'] = data['membership_id'];
            components['token_type'] = data['token_type'];

            // Store Access token info
            AccessToken['inception'] = Math.round(new Date().getTime() / 1000); // Seconds
            AccessToken['expires_in'] = data['expires_in'];
            AccessToken['value'] = data['access_token'];

            // Store Refresh token info
            RefreshToken['inception'] = Math.round(1); // Dev testing -- new Date().getTime() / 1000
            RefreshToken['expires_in'] = data['refresh_expires_in'];
            RefreshToken['value'] = data['refresh_token'];

            // Push all to localStorage
            window.localStorage.setItem('accessToken', JSON.stringify(AccessToken));
            window.localStorage.setItem('components', JSON.stringify(components));
            window.localStorage.setItem('refreshToken', JSON.stringify(RefreshToken));

            log('-> Authorized with Bungie.net');
        })
        .catch((err) => {

            // switch (err.response.data) {
            //     case 'AuthorizationCodeInvalid':
            //     case 'AuthorizationCodeStale':
            //         window.location.href = `https://www.bungie.net/en/oauth/authorize?&client_id=${clientId}&response_type=code`;
            //     case 'ApplicationTokenKeyIdDoesNotExist':
            //         CheckUserTokens();
            // };
            console.error(err);
        });
};
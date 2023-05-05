import axios from 'axios';
import { requestHeaders, log, homeUrl } from '../user.js';
import { ClearApplicationData } from './ClearApplicationData.js';

// Check tokens for expiration
export async function CheckUserTokens () {

    log('-> CheckUserTokens Called');
    
    let acToken = JSON.parse(window.localStorage.getItem('accessToken'));
    let rsToken = JSON.parse(window.localStorage.getItem('refreshToken'));
    let comps = JSON.parse(window.localStorage.getItem('components'));
    let RefreshToken = {};
    let AccessToken = {};
    let components = {};
    let AuthConfig = {
            headers: {
                Authorization: `Basic ${requestHeaders.Authorization}`,
                "Content-Type": "application/x-www-form-urlencoded"
            }
        };

    // Self function to refresh tokens
    const RefreshTokens = async function () {
        log('---> Tokens expired');
        await axios.post('https://www.bungie.net/Platform/App/OAuth/token/', `grant_type=refresh_token&refresh_token=${rsToken.value}`, AuthConfig)
            .then(res => {

                let data = res.data;
                components['membership_id'] = data['membership_id'];
                components['token_type'] = data['token_type'];

                AccessToken['inception'] = Math.round(new Date().getTime() / 1000); // Seconds
                AccessToken['expires_in'] = data['expires_in'];
                AccessToken['value'] = data['access_token'];

                RefreshToken['inception'] = Math.round(new Date().getTime() / 1000); // Seconds
                RefreshToken['expires_in'] = data['refresh_expires_in'];
                RefreshToken['value'] = data['refresh_token'];

                window.localStorage.setItem('accessToken', JSON.stringify(AccessToken));
                window.localStorage.setItem('components', JSON.stringify(components));
                window.localStorage.setItem('refreshToken', JSON.stringify(RefreshToken));
            })
            .catch(err => {
                console.error(err);

                // Restart OAuthFlow
                switch (err.response.data['error_description']) {
                    case 'AuthorizationCodeInvalid':
                    case 'AuthorizationCodeStale':
                    case 'ProvidedTokenNotValidRefreshToken':
                        ClearApplicationData();
                        window.location.href = `https://www.bungie.net/en/oauth/authorize?&client_id=${clientId}&response_type=code`;
                };
            });
            log('---> Tokens refreshed');
    };


    // Remove invalid window.localStorage items & Redirect if items are missing
    let tokenKeys = ['inception', 'expires_in', 'value'];
    let componentKeys = ['membership_id', 'token_type'];
    let keyNames = [...componentKeys, ...tokenKeys];

    // If any of the tokens dont exist, redirect to home
    if (!rsToken || !acToken || !comps) {
        ClearApplicationData(false, true);
    };

    // Check for, and remove, foregin objects in window storage
    Object.keys(rsToken).forEach(item => {
        if (!keyNames.includes(item)) delete rsToken[item], window.localStorage.setItem('refreshToken', JSON.stringify(rsToken));
    });
    Object.keys(acToken).forEach(item => {
        if (!keyNames.includes(item)) delete acToken[item], window.localStorage.setItem('accessToken', JSON.stringify(acToken));
    });
    Object.keys(comps).forEach(item => {
        if (!keyNames.includes(item)) delete comps[item], window.localStorage.setItem('components', JSON.stringify(comps));
    });

    // Check for missing objects in window storage -- Reset if so
    Object.keys(tokenKeys).forEach(item => {
        if (!Object.keys(rsToken).includes(tokenKeys[item])) ClearApplicationData(false, true);
        if (!Object.keys(acToken).includes(tokenKeys[item])) ClearApplicationData(false, true);
    });
    Object.keys(componentKeys).forEach(item => {
        if (!Object.keys(comps).includes(componentKeys[item])) ClearApplicationData(false, true);
    });

    // Calculate if either tokens have expired
    let isAcTokenExpired = (acToken.inception + acToken['expires_in']) <= Math.round(new Date().getTime() / 1000) - 1;
    let isRsTokenExpired = (rsToken.inception + rsToken['expires_in']) <= Math.round(new Date().getTime() / 1000) - 1;
    if (isAcTokenExpired || isRsTokenExpired) {

        // If either tokens have expired
        await RefreshTokens();
    };
    log('-> CheckUserTokens Finished');
};
import axios from 'axios';
import { axiosHeaders, log, homeUrl } from '../user.js';
import { ClearApplicationData } from './ClearApplicationData.js';
import { RedirectUser } from '../modules/RedirectUser.js';

// Check tokens for expiration
export async function CheckUserTokens () {

    log('-> CheckUserTokens Called');
    
    let acToken = JSON.parse(window.localStorage.getItem('accessToken')),
        rsToken = JSON.parse(window.localStorage.getItem('refreshToken')),
        comps = JSON.parse(window.localStorage.getItem('components')),
        RefreshToken = {},
        AccessToken = {},
        components = {},
        AuthConfig = {
            headers: {
                Authorization: `Basic ${axiosHeaders.Authorization}`,
                "Content-Type": "application/x-www-form-urlencoded"
            }
        };

    // Self function to refresh tokens
    const RefreshTokens = async function () {
        isAcTokenExpired ? log('---> Access Token Expired') : log('---> Refresh Token Expired');
        await axios.post('https://www.bungie.net/Platform/App/OAuth/token/', `grant_type=refresh_token&refresh_token=${rsToken.value}`, AuthConfig)
            .then(res => {

                let data = res.data;
                components["membership_id"] = data["membership_id"];
                components["token_type"] = data["token_type"];

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
                switch (err.response.data['error_description']) {
                    case 'AuthorizationCodeInvalid':
                    case 'AuthorizationCodeStale':
                    case 'ProvidedTokenNotValidRefreshToken':
                        // Restart OAuthFlow
                        ClearApplicationData();
                        window.location.href = `https://www.bungie.net/en/oauth/authorize?&client_id=${clientId}&response_type=code`;
                };
            });
        isAcTokenExpired ? log('---> Access Token Refreshed') : log('---> Refresh Token Refreshed');
    };


    // Remove invalid window.localStorage items & Redirect if items are missing
    var keyNames = ['value', 'inception',  'expires_in', 'membership_id', 'token_type'],
        cKeys = ['membership_id', 'token_type'],
        tokenKeys = ['inception', 'expires_in', 'value'];

    // If any of the tokens dont exist, redirect to home
    if (!rsToken || !acToken || !comps) RedirectUser(homeUrl, 'rsToken=true&acToken=true&comps=true');

    Object.keys(rsToken).forEach(item => {
        if (!keyNames.includes(item)) delete rsToken[item], window.localStorage.setItem('refreshToken', JSON.stringify(rsToken));
    });
    Object.keys(acToken).forEach(item => {
        if (!keyNames.includes(item)) delete acToken[item], window.localStorage.setItem('accessToken', JSON.stringify(acToken));
    });
    Object.keys(comps).forEach(item => {
        if (!keyNames.includes(item)) delete comps[item], window.localStorage.setItem('components', JSON.stringify(comps));
    });

    Object.keys(tokenKeys).forEach(item => {
        if (!Object.keys(rsToken).includes(tokenKeys[item])) RedirectUser(homeUrl, 'rsToken=true');
        if (!Object.keys(acToken).includes(tokenKeys[item])) RedirectUser(homeUrl, 'acToken=true');
    });
    Object.keys(cKeys).forEach(item => {
        if (!Object.keys(comps).includes(cKeys[item])) RedirectUser(homeUrl, 'comps=true');
    });


    // Check if either tokens have expired
    let isAcTokenExpired = (acToken.inception + acToken['expires_in']) <= Math.round(new Date().getTime() / 1000) - 1,
        isRsTokenExpired = (rsToken.inception + rsToken['expires_in']) <= Math.round(new Date().getTime() / 1000) - 1;
    if (isAcTokenExpired || isRsTokenExpired) {

        // If either tokens have expired
        await RefreshTokens();
    };
    log('-> CheckUserTokens Finished');
};
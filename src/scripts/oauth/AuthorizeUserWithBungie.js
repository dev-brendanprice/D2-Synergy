
// Authorize with Bungie.net
// @string {authCode}
export async function AuthorizeUserWithBungie (authCode) {
    
    let AccessToken = {};
    let RefreshToken = {};
    let components = {};

    const client_id = parseInt(import.meta.env.CLIENT_ID);
    const client_secret = import.meta.env.AUTH;
    const headers = { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" };
    const body = new URLSearchParams({ grant_type: "authorization_code", code: authCode, client_id: client_id, client_secret: client_secret });

    await fetch('https://www.bungie.net/platform/app/oauth/token', {
        method: 'POST',
        headers: headers,
        body: body
    }).then(res => res.json())
        .then(data => {

            console.log(data);

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

            console.log('-> Authorized with Bungie.net');

        })
        .catch(err => {

            switch (err.response.data) {
                case 'AuthorizationCodeInvalid':
                case 'AuthorizationCodeStale':
                    window.location.href = `https://www.bungie.net/en/oauth/authorize?&client_id=${client_id}&response_type=code`;
                case 'ApplicationTokenKeyIdDoesNotExist':
                    CheckUserTokens(false);
            };
            console.error(err);
        });
};
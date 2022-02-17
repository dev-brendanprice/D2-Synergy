const { access } = require("fs");

console.log('%cD2 SYNERGY _V0.3', 'font-weight: bold;font-size: 40px;color: white;');
console.log('// Please report any errors to @beru2003 on Twitter.')
var log = console.log.bind(console);
var localStorage = window.localStorage;


// const GenerateState = (len) => {
//     let result = ' ';
//     let characters ='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
//     let charactersLength = characters.length;
//         for ( let i = 0; i < len; i++ ) {
//             result += characters.charAt(Math.floor(Math.random() * charactersLength));
//         };
//     return result;
// };
// const stateCode = GenerateState(128);
// localStorage.setItem('stateCode', stateCode);

window.addEventListener('DOMContentLoaded', () => {
    document.getElementById('btnAuthorize').addEventListener('click', () => {
        window.location.href = `https://www.bungie.net/en/oauth/authorize?&client_id=38074&response_type=code`;
    });
});

// Check to see if users' token has expired
// var components = localStorage.getItem('components'),
//     accessTokenKey = localStorage.getItem('accessToken'),
//     refreshTokenKey = localStorage.getItem('refreshToken');
    
// if (components && accessTokenKey && refreshTokenKey) {
//     if (accessTokenKey['expires_in']+accessTokenKey['inception'] > new Date()) {
//         localStorage.clear();
//     } 
//     else if (accessTokenKey['expires_in']+accessTokenKey['inception'] < new Date()) {
//         // let user through
//     };
// };
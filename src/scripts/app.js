console.log('%cD2 SYNERGY _V0.3', 'font-weight: bold;font-size: 40px;color: white;');
console.log('// Welcome to D2Synergy, Please report any errors to @beru2003 on Twitter.');

var log = console.log.bind(console),
    localStorage = window.localStorage;


const GenerateState = (len) => {
    let result = ' ';
    let characters ='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let charactersLength = characters.length;
        for ( let i = 0; i < len; i++ ) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        };
    return result;
};
const stateCode = GenerateState(512);
localStorage.setItem('stateCode', stateCode);

window.addEventListener('DOMContentLoaded', () => {
    document.getElementById('btnAuthorize').addEventListener('click', () => {
        window.location.href = `https://www.bungie.net/en/oauth/authorize?&client_id=38074&response_type=code&state=${stateCode}`;
    });
});
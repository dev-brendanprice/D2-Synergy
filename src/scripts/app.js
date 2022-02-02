console.log('%c D2 SYNERGY _V0.3', 'font-weight: bold;font-size: 40px;color: white;');
var log = console.log.bind(console);
var localStorage = window.localStorage;


const GenerateState = (len) => {
    let result = ' ';
    let characters ='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let charactersLength = characters.length;
        for ( let i = 0; i < len; i++ ) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        };
    return result;
};

document.getElementById('btnAuth').addEventListener('click', () => {
    window.location.href = `https://www.bungie.net/en/oauth/authorize?&client_id=38074&response_type=code`;
});
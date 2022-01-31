var log = console.log.bind(console);
var localStorage = window.localStorage;

const AxiosConfig = {
    headers: {
        "Authorization": `Basic ${btoa('38074:9qBsYpKC7ieWB4pffobacY7weIcziSmmfDXc.nwe8S8')}`,
        "Content-Type": "application/x-www-form-urlencoded",
    }
};
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
    // var state = GenerateState(128);
    // localStorage.setItem('state_variable', state);
    window.location.href = `https://www.bungie.net/en/oauth/authorize?&client_id=38074&response_type=code`;
});
console.log('%c D2 Synergy', 'font-weight: bold; font-size: 50px;color: red; text-shadow: 3px 3px 0 rgb(217,31,38) , 6px 6px 0 rgb(226,91,14) , 9px 9px 0 rgb(245,221,8) , 12px 12px 0 rgb(5,148,68) , 15px 15px 0 rgb(2,135,206) , 18px 18px 0 rgb(4,77,145) , 21px 21px 0 rgb(42,21,113)');
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
    window.location.href = `https://www.bungie.net/en/oauth/authorize?&client_id=38074&response_type=code`;
});
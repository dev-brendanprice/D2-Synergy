var log = console.log.bind(console);
var localStorage = window.localStorage;

const AxiosConfig = {
    headers: {
        "Authorization": `Basic ${btoa('38074:9qBsYpKC7ieWB4pffobacY7weIcziSmmfDXc.nwe8S8')}`,
        "Content-Type": "application/x-www-form-urlencoded",
    }
};

const AuthorizeBungie = async () => {
    var AuthorizationCode = window.location.search.replace('?code=','');
    var components = {};

    try {
        await axios.post('https://www.bungie.net/platform/app/oauth/token/', `grant_type=authorization_code&code=${AuthorizationCode}`, AxiosConfig)
        .then(res => {
            components = res.data;
            components['authorization_code'] = AuthorizationCode;
            localStorage.setItem('components', JSON.stringify(components));
        })
        .catch(err => {
            throw err;
        });
    } 
    catch (error) {
        log('InvalidParams: @{Resetting Params}');
        window.location.href = `https://www.bungie.net/en/oauth/authorize?&client_id=38074&response_type=code`;
    };
};

const FetchBungieUserDetails = async () => {
    var AuthorizationCode = JSON.parse(localStorage.getItem('components'))['authorization_code'];
    var MembershipId = JSON.parse(localStorage.getItem('components'))['membership_id'];
    var bungieNetUser = {};

    try {
        await axios.post(`https://www.bungie.net/Platform/User/GetBungieNetUserById/${MembershipId}/`, `grant_type=authorization_code&code=${AuthorizationCode}`, AxiosConfig)
        .then(res => {
            bungieNetUser = res.data;
            localStorage.setItem('bungieNetUser', bungieNetUser);
        })
        .catch(err => {
            log(err)
        });
    }
    catch (error) {
        // Do something if it returns error; maybe a pop-up saying "do you want to try again or re-authorize completely (logout)"
    };
};

AuthorizeBungie()
.then(() => {
    FetchBungieUserDetails();
});
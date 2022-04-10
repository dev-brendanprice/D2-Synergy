
// Check if state query parameter exists in URL
const VerifyState = async () => {

    var urlParams = new URLSearchParams(window.location.search),
        state = urlParams.get('state');

    if (state != window.localStorage.getItem('stateCode')) {
        window.localStorage.clear();
        window.sessionStorage.clear();
        window.location.href = `http://86.2.10.33:4645/D2Synergy-v0.3/www/views/index.html`;
    }
    else {
        window.localStorage.removeItem('stateCode');
    };
};


export { VerifyState };
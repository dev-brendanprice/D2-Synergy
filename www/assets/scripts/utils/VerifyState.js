
// Check if state query parameter exists in URL
const VerifyState = async () => {

    var urlParams = new URLSearchParams(window.location.search),
        state = urlParams.get('state');

    if (state != window.localStorage.getItem('stateCode')) {
        window.localStorage.clear();
        window.sessionStorage.clear();
        window.location.href = `https://synergy.brendanprice.xyz`;
    }
    else {
        window.localStorage.removeItem('stateCode');
    };
};


export { VerifyState };
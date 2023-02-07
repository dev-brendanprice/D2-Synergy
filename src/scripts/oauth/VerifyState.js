// Check if state query parameter exists in URL
export async function VerifyState() {

    let urlParams = new URLSearchParams(window.location.search);
    let state = urlParams.get('state');

    // Check if state code exists in localStorage
    if (state != window.localStorage.getItem('stateCode')) {
        window.localStorage.clear();
        window.sessionStorage.clear();
        window.location.reload();
    }
    else { // ?? Window.window ???
        window.window.localStorage.removeItem('stateCode');
    };
};

// Redirect user back to specified url
// @string {url}, @string {param}
export function RedirectUser(url, param) {
    window.location.href = `${url}?${param ? param : ''}`;
};
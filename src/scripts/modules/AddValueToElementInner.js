// Adds something to the targets' innerHTML
// @string {target}, @string {content}
export function AddValueToElementInner(target, content) {
    // Change target innerHTML
    document.getElementById(`${target}`).innerHTML = content;
};
// Change progress bar %progress
// @string {target}, @int {percent}
export function ChangeProgressBar(target, percent) {
    // Change width of progress bar
    document.getElementById(`${target}`).style.width = `${percent}%`;
};
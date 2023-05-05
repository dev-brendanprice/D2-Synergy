
// Add loading bar and text to animate
// @boolean {passiveLoad}
export function StartLoad(isPassiveReload) {

    // Turn on loading spinner and turn off checkmark
    document.getElementById('loadingSpinner').style.display = 'flex';
    document.getElementById('notificationCheckmark').style.display = 'none';

    // Show notification container and check if passiveReload to show skeleton load container
    document.getElementById('notificationContainer').style.display = 'block';
    if (!isPassiveReload) {
        document.getElementById('skeletonLoadContainer').style.display = 'flex';
    };
};
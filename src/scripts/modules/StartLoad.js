
// Add loading bar and text to animate
// @boolean {passiveLoad}
export function StartLoad(passiveLoad) {

    if (passiveLoad) {
        document.getElementById('loadBarContainer').style.display = 'flex';
        return;
    };

    // Toggle the notification loading animation spinner
    document.getElementById('loadingSpinner').style.display = 'flex';
    document.getElementById('notificationCheckmark').style.display = 'none';

    document.getElementById('notificationContainer').style.display = 'block';
    document.getElementById('skeletonLoadContainer').style.display = 'flex';
};
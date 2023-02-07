
// Remove loading bar and text to animate
// @boolean {passiveLoad}
export function StopLoad(passiveLoad) {
    
    if (passiveLoad) {
        document.getElementById('loadBarContainer').style.display = 'none';
        return;
    };
    
    // Hide the skeleton loading container
    document.getElementById('skeletonLoadContainer').style.display = 'none';

    // Toggle the notification loading animation spinner
    document.getElementById('loadingSpinner').style.display = 'none';
    document.getElementById('notificationCheckmark').style.display = 'flex';

    // Change notification text
    document.getElementById('notificationTitle').innerHTML = 'Loading Complete';
    document.getElementById('notificationMessage').innerHTML = 'Your data has been loaded';

    // Do a fade out animation on the notification container
    setTimeout(() => {
        document.getElementById('notificationContainer').classList += 'fade-out';

        // Then display none the notification container
        setTimeout(() => {
            document.getElementById('notificationContainer').style.display = 'none';
        }, 300);
    }, 4000);

    // If mobile view (temp fix)
    if (window.innerWidth <= 645) {
        document.getElementById('containerThatHasTheSideSelectionAndContentDisplay').style.display = 'block';
        return;
    };
    document.getElementById('containerThatHasTheSideSelectionAndContentDisplay').style.display = 'flex';
};
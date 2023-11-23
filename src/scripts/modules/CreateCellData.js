
const log = console.log.bind(console);

export function createCellDat(profile) {

    let memship = profile.memship; // get memship for ez access
    log(profile);

    // Create cell for table
    const img = document.createElement('img');
    img.classList = 'support-cell';
    img.src = `https://www.bungie.net${profile.emblemPath}`;
    document.getElementsByClassName('support-page-grid-container')[0].append(img);



    // Create container for onhover element
    const containerForOverlay = document.createElement('div');
    const hoverContainer = document.createElement('div');
    containerForOverlay.classList = 'containerForOverlay';
    hoverContainer.classList = 'onhoverContainer';
    hoverContainer.id = `memship_${memship}`;

    // Create container for emblem & add content
    const topContainer = document.createElement('div');
    const topTextContainer = document.createElement('div');
    const topMainText = document.createElement('div');
    const topUsername = document.createElement('div');
    const topClanName = document.createElement('div');
    const powerContainer = document.createElement('div');
    const powerIcon = document.createElement('img');
    const powerLevel = document.createElement('div');
    const emblemContainer = document.createElement('div');
    const emblemBackground = document.createElement('img');
    topContainer.classList = 'onhoverTopContentContainer';
    topTextContainer.classList = 'onhoverTopTextContainer';
    topMainText.classList = 'onhoverTopTextMain';
    topUsername.classList = 'onhoverTopUser';
    topClanName.classList = 'onhoverTopClan';
    powerContainer.classList = 'onhoverTopPowerCon';
    powerIcon.classList = 'powericon';
    powerLevel.classList = 'powerText';
    emblemContainer.classList = 'onhoverEmblemContainer';
    emblemBackground.classList = 'onhoverEmblemIcon';

    topUsername.innerHTML = profile.uname;
    topClanName.innerHTML = profile.cname;
    powerLevel.innerHTML = profile.light;
    
    powerIcon.src = './static/ico/destiny-icons/power2.svg';
    log(profile.emblemBackgroundPath);
    emblemBackground.src = `https://www.bungie.net/${profile.emblemBackgroundPath}`;

    emblemContainer.append(emblemBackground);
    powerContainer.append(powerIcon, powerLevel);
    topMainText.append(topUsername, topClanName);
    topTextContainer.append(topMainText, powerContainer);
    topContainer.append(topTextContainer, emblemContainer);

    hoverContainer.append(topContainer); // Append to top-most container


    // Check if primary character has a title equipped
    if (profile.titleName) {

        // Create container for seal & add content
        const sealContainer = document.createElement('div');
        const sealBackground = document.createElement('div');
        const sealBarTop = document.createElement('div');
        const sealBarBg = document.createElement('div');
        const sealBarBot = document.createElement('div');
        const sealContent = document.createElement('div');
        const sealIcon = document.createElement('img');
        const sealName = document.createElement('div');
        sealContainer.classList = 'onhoverSealContainer';
        sealBackground.classList = 'onhoverSealBg';
        sealBarTop.classList = 'onhoverSealBgWrapBars';
        sealBarBg.classList = 'onhoverSealContentBg';
        sealBarBot.classList = 'onhoverSealBgWrapBars';
        sealContent.classList = 'onhoverSealContent';
        sealIcon.style.width = '23px';
        sealName.classList = 'onhoverSealContentText';

        sealName.innerHTML = profile.titleName;

        sealContent.append(sealIcon, sealName);
        sealBackground.append(sealBarTop, sealBarBg, sealBarBot);
        sealContainer.append(sealBackground, sealContent);

        hoverContainer.append(sealContainer); // Append to top-most container
    };


    // Create container for commendation & add content
    // ..
    




    containerForOverlay.appendChild(hoverContainer);
    document.getElementById('overlays').appendChild(containerForOverlay);

    // Create event listener for mouse move event
    // img.addEventListener('mousemove', function(e) {

    //     containerForOverlay.style.display = 'block';
    //     containerForOverlay.style.top = `${e.clientY + 45}px`;

    //     // Check for screen bounds - change offset
    //     if (e.pageX >= 500) {
    //         containerForOverlay.style.left = `${e.clientX - 400}px`;
    //     }
    //     else {
    //         containerForOverlay.style.left = `${e.clientX + 30}px`;
    //     };
    // });

    // img.addEventListener('mouseleave', function() {
    //     containerForOverlay.style.display = 'none';
    // });
};
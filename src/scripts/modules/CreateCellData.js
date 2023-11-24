import messages from '../../data/supporterMessages.js';

const log = console.log.bind(console);
log(messages);

export function createCellDat(profile) {

    let memship = profile.memship; // get memship for ez access

    // Create cell for table
    const img = document.createElement('img');
    img.classList = 'support-cell-player';
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

        sealIcon.src = './static/ico/seal-icon.svg';
        sealName.innerHTML = profile.titleName;

        // Check for gilded title
        if (profile.isTitleGilded) {
            sealBarTop.style.backgroundColor = '#644C2C';
            sealBarBg.style.backgroundColor = '#30291B';
            sealBarBot.style.backgroundColor = '#644C2C';
            sealName.style.color = '#EDB25E';
            sealIcon.src = './static/ico/seal-icon-gild.svg';
        };

        sealContent.append(sealIcon, sealName);
        sealBackground.append(sealBarTop, sealBarBg, sealBarBot);
        sealContainer.append(sealBackground, sealContent);

        // Create divider line
        const divider = document.createElement('div');
        divider.classList = 'onhoverDividerLine';

        hoverContainer.append(sealContainer, divider); // Append to top-most container
    };


    // Check if commendations (are worth) show(ing)
    let commsArr = profile.comms;
    if (commsArr.totalScore > 0 || commsArr.totalScore) {

        // Create container for commendation & add content
        const commContainer = document.createElement('div');
        const commTop = document.createElement('div');
        const commTotalWrapper = document.createElement('div');
        const commIcon = document.createElement('img');
        const commTotalText = document.createElement('div');
        const commScoreSR = document.createElement('div');
        const commSentContainer = document.createElement('div');
        const commSentText = document.createElement('div');
        const commSentValue = document.createElement('div');
        const commRecContainer = document.createElement('div');
        const commRecText = document.createElement('div');
        const commRecValue = document.createElement('div');
        const commRatioBarContainer = document.createElement('div');
        const ratioOne = document.createElement('div');
        const ratioTwo = document.createElement('div');
        const ratioThree = document.createElement('div');
        const ratioFour = document.createElement('div');
        const commRatioTextContainer = document.createElement('div');
        const ratioTextOne = document.createElement('div');
        const ratioTextTwo = document.createElement('div');
        const ratioTextThree = document.createElement('div');
        const ratioTextFour = document.createElement('div');
        commContainer.classList = 'onhoverCommendationsContainer';
        commTop.classList = 'onhoverCommendationsTop';
        commTotalWrapper.style = 'display: flex;gap: 5px;';
        commIcon.style = 'width: 20px;';
        commIcon.src = './static/ico/commendations-icon.svg';
        commTotalText.classList = 'onhoverCommendationsTotalText';
        commScoreSR.style = 'display: flex;margin-top: 10px;gap: 10px;';
        commSentContainer.classList = 'onhoverCommendationsTopText';
        commSentText.classList = 'onhoverCommendationsTopSubText';
        commRecContainer.classList = 'onhoverCommendationsTopText';
        commRecText.classList = 'onhoverCommendationsTopSubText';
        commRatioBarContainer.classList = 'onhoverCommendationsRatioBars';
        commRatioTextContainer.classList = 'onhoverCommendationsRatioNumbers';

        // Total score & sent/received
        commSentText.innerHTML = 'Sent ';
        commRecText.innerHTML = 'Received '; // idk why
        commTotalText.innerHTML = Intl.NumberFormat().format(commsArr.totalScore);
        commSentValue.innerHTML = Intl.NumberFormat().format(commsArr.details.sent);
        commRecValue.innerHTML = Intl.NumberFormat().format(commsArr.details.received);
        commSentContainer.append(commSentText, commSentValue);
        commRecContainer.append(commRecText, commRecValue);
        commScoreSR.append(commSentContainer, commRecContainer);
        commTotalWrapper.append(commIcon, commTotalText);
        commTop.append(commTotalWrapper, commScoreSR);

        // Do commendation ratio bars
        ratioOne.style = 'height: 7px;background: #36A389;';
        ratioOne.style.width = `${commsArr.nodes[0][1]}%`;
        ratioTwo.style = 'height: 7px;background: #CD7D2C;';
        ratioTwo.style.width = `${commsArr.nodes[1][1]}%`;
        ratioThree.style = 'height: 7px;background: #BE4F6A;';
        ratioThree.style.width = `${commsArr.nodes[2][1]}%`;
        ratioFour.style = 'height: 7px;background: #3288C1;';
        ratioFour.style.width = `${commsArr.nodes[3][1]}%`;
        commRatioBarContainer.append(ratioOne, ratioTwo, ratioThree, ratioFour);

        // Do commendation ratio text for each bar
        ratioTextOne.style = `width: ${commsArr.nodes[0][1]}%;color: #36A389;`;
        ratioTextOne.innerHTML = commsArr.nodes[0][1];
        ratioTextTwo.style = `width: ${commsArr.nodes[1][1]}%;color: #CD7D2C;`;
        ratioTextTwo.innerHTML = commsArr.nodes[1][1];
        ratioTextThree.style = `width: ${commsArr.nodes[2][1]}%;color: #BE4F6A;`;
        ratioTextThree.innerHTML = commsArr.nodes[2][1];
        ratioTextFour.style = `width: ${commsArr.nodes[3][1]}%;color: #3288C1;`;
        ratioTextFour.innerHTML = commsArr.nodes[3][1];
        commRatioTextContainer.append(ratioTextOne, ratioTextTwo, ratioTextThree, ratioTextFour);
        
        // Append all to parent container
        commContainer.append(commTop, commRatioBarContainer, commRatioTextContainer);

        // Create divider line
        const divider = document.createElement('div');
        divider.classList = 'onhoverDividerLine';

        hoverContainer.append(commContainer, divider); // Append to top-most container
    };


    // Append guardian rank
    const userRecordsContainer = document.createElement('div');
    userRecordsContainer.classList = 'onhoverUserRecordsContainer';

    let recordCounter = 0;
    let gr = profile.guardianRank;

    if (gr >= 1) {

        recordCounter++; // Increment counter
        let rankStrings = {
            1: 'New Light',
            2: 'Explorer',
            3: 'Initiate',
            4: 'Scout',
            5: 'Adventurer',
            6: 'Veteran',
            7: 'Elite',
            8: 'Justiciar',
            9: 'Vanquisher',
            10: 'Exemplar',
            11: 'Paragon'
        };

        // Create container for guardian rank & add content
        const guardianRankContainer = document.createElement('div');
        const guardianRankIcon = document.createElement('img');
        const guardianRank = document.createElement('div');
        guardianRankContainer.classList = 'onhoverRecordCon';
        guardianRankIcon.style = 'width: 28px;';

        if (gr <= 6) guardianRankIcon.style = 'width: 20px;';

        guardianRankIcon.src = `./static/ico/guardian-rank-${gr}.svg`;
        guardianRank.innerHTML = rankStrings[gr];
        guardianRankContainer.append(guardianRankIcon, guardianRank);
        userRecordsContainer.append(guardianRankContainer);
    };

    // Append season pass level
    let sr = profile.splevel;
    if (sr >= 1) {

        recordCounter++; // Increment Counter

        // Create container for season pass level & add content
        const seasonLevelContainer = document.createElement('div');
        const seasonLevelIcon = document.createElement('img');
        const seasonLevel = document.createElement('div');
        seasonLevelContainer.classList = 'onhoverRecordCon';
        seasonLevelIcon.style = 'width: 18px;';
        seasonLevel.style = 'color: #00D4D4;';
        
        seasonLevelIcon.src = './static/ico/season-rank-icon.svg';
        seasonLevel.innerHTML = Intl.NumberFormat().format(sr);
        seasonLevelContainer.append(seasonLevelIcon, seasonLevel);
        userRecordsContainer.append(seasonLevelContainer);
    };

    // Append triumph score
    let tr = profile.tscore;
    if (tr >= 0) {

        recordCounter++; // Increment Counter

        // Create container for triumph score & add content
        const triumphScoreContainer = document.createElement('div');
        const triumphScoreIcon = document.createElement('img');
        const triumphScore = document.createElement('div');
        triumphScoreContainer.classList = 'onhoverRecordCon';
        triumphScoreIcon.style = 'width: 13px;';
        triumphScore.style = 'color: #F2E296;';

        triumphScoreIcon.src = './static/ico/triumph-score-icon.svg';
        triumphScore.innerHTML = Intl.NumberFormat().format(tr);
        triumphScoreContainer.append(triumphScoreIcon, triumphScore);
        userRecordsContainer.append(triumphScoreContainer);
    };
    

    // Check if records (are worth) show(ing)
    if (recordCounter >= 1) {

        // Create and append divider line
        const divider = document.createElement('div');
        divider.classList = 'onhoverDividerLine';

        // Append records
        hoverContainer.append(userRecordsContainer, divider);
    };


    // Append bungie name
    let bname = profile.uname;
    let bcode = profile.displayCode;
    if (bname && bcode) {
        
        // Create container for bungie name & add content
        const bnameContainer = document.createElement('div');
        const bnameIcon = document.createElement('img');
        const bnameTextWrapper = document.createElement('div');
        const bnameUsername = document.createElement('div');
        const bnameDisplaycode = document.createElement('div');
        bnameContainer.classList = 'onhoverBungienameContainer';
        bnameTextWrapper.classList = 'onhoverBungienameTextCon';
        bnameIcon.style = 'width: 16px;';
        bnameUsername.style = 'color: #AFAFAF;';
        bnameDisplaycode.style = 'color: #4BABD5';

        bnameIcon.src = './static/ico/bungiename-icon.svg';
        bnameUsername.innerHTML = bname;
        bnameDisplaycode.innerHTML = `#${bcode}`;
        bnameTextWrapper.append(bnameUsername, bnameDisplaycode);
        bnameContainer.append(bnameIcon, bnameTextWrapper);

        // Create and append divider line
        const divider = document.createElement('div');
        divider.classList = 'onhoverDividerLine';

        hoverContainer.append(bnameContainer, divider);
    };


    // Check if a message exists for this user
    if (messages[memship].msg) {
        
        let dat = messages[memship];

        // Create container for user message & add content
        const messageContainer = document.createElement('div');
        const messageIcon = document.createElement('img');
        const messageText = document.createElement('div');
        messageContainer.classList = 'onhoverUserMessageContainer';
        messageText.classList = 'onhoverUserMessageText';
        messageIcon.style = 'width: 20px;height: 20px;';

        messageIcon.src = `//${dat.ico}`;
        messageText.innerHTML = `"${dat.msg}"`;
        messageContainer.append(messageIcon, messageText);
        hoverContainer.append(messageContainer);
    };


    // Push entire container to overlays DOM element
    containerForOverlay.appendChild(hoverContainer);
    document.getElementById('overlays').appendChild(containerForOverlay);


    // Create event listener for mouse move event
    img.addEventListener('mousemove', function(e) {

        containerForOverlay.style.display = 'block';
        containerForOverlay.style.top = `${e.clientY + 45}px`;

        // Check for screen bounds - change offset
        if (e.pageX >= 500) {
            containerForOverlay.style.left = `${e.clientX - 400}px`;
        }
        else {
            containerForOverlay.style.left = `${e.clientX + 30}px`;
        };
    });

    img.addEventListener('mouseleave', function() {
        containerForOverlay.style.display = 'none';
    });
};
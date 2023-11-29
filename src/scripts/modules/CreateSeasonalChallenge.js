
import { itemDefinitions, objectiveDefinitions, log } from '../user.js';

// Function creates two challenges, one in compact and the other wide
//      it will then append both to the corresponding hierarchies
export function CreateSeasonalChallenge(challengeData, weekString, isRedacted) {

    // Create a compact (UI) challenge
    function createCompactChallenge(challengeData, weekString, isRedacted) {

        // Check if challenge is redacted
        if (isRedacted) {

            // // Create elements
            // const cellContainer = document.createElement('div');
            // const outerContainer = document.createElement('div');
            // const mainIcon = document.createElement('img');
            // const innerTextContent = document.createElement('div');

            // // Assign classes
            // cellContainer.className = 'cellRedacted compact';
            // outerContainer.className = 'cellOuter_compact';
            // mainIcon.className = 'cellIconMain_compact';
            // innerTextContent.className = 'cellInnerTextContent_compact';

            // // Add content
            // mainIcon.src = './static/ico/redacted.png';
            // innerTextContent.innerHTML = challengeData.displayProperties.name;

            // // Hierarchy
            // outerContainer.append(mainIcon, innerTextContent);
            // cellContainer.append(outerContainer);
            // document.getElementById(`compact_${weekString}`).appendChild(cellContainer);

            return;
        };

        // Create elements
        const cellContainer = document.createElement('div');
        const outerContainer = document.createElement('div');
        const mainIcon = document.createElement('img');
        const innerContainer = document.createElement('div');
        const innerTextWrapper = document.createElement('div');
        const innerTextContent = document.createElement('div');
        const iconsContainer = document.createElement('div');
        const progressBarBackground = document.createElement('div');
        const progressBarProgress = document.createElement('div');

        // Assign classes
        cellContainer.className = 'cell compact';
        outerContainer.className = 'cellOuter_compact';
        mainIcon.className = 'cellIconMain_compact';
        innerContainer.className = 'cellInner_compact';
        innerTextWrapper.className = 'cellInnerTextWrapper_compact';
        innerTextContent.className = 'cellInnerTextContent_compact';
        iconsContainer.className = 'cellIconsContainer_compact';
        progressBarBackground.className = 'cellBarBackground_compact';
        progressBarProgress.className = 'cellBarProgress_compact';

        // Add content
        mainIcon.src = `https://bungie.net${challengeData.displayProperties.icon}`;
        innerTextContent.innerHTML = challengeData.displayProperties.name;

        // Loop over challenge rewards, do the same process
        for (let reward of challengeData.rewardItems) {
            
            // Create elements
            const rewardDefinition = itemDefinitions[reward.itemHash];
            const compactIcon = document.createElement('img');

            // Assign classes, Add content
            compactIcon.className = 'icon_compact';
            compactIcon.src = `https://bungie.net${rewardDefinition.displayProperties.icon}`;

            // Add to hierarchy
            iconsContainer.appendChild(compactIcon);
        };

        // Change style/width of progress bar, based on completion percent
        if (challengeData.isComplete) {
            progressBarProgress.style.width = '100%';
            progressBarProgress.style.backgroundColor = '#33655E';
        }
        else {
            progressBarProgress.style.width = `${challengeData.progressionPercent}%`;
        };

        // Change style of progress bar, based on isClaimed property
        if (!challengeData.isClaimed && challengeData.isComplete) {
            progressBarProgress.style.backgroundColor = '#33655E';
            cellContainer.className = 'cellClaimable compact';
        }
        else if (challengeData.isClaimed && challengeData.isComplete) {
            progressBarProgress.style.backgroundColor = '#2D6A76';
            cellContainer.className = 'cellCompleted compact';
        };

        // Build progress bar
        progressBarBackground.appendChild(progressBarProgress);
        
        // Build text wrapper and icons container
        innerTextWrapper.appendChild(innerTextContent);
        innerContainer.append(innerTextWrapper, iconsContainer);

        // Add everything onto topmost container
        outerContainer.append(mainIcon, innerContainer);
        cellContainer.append(outerContainer, progressBarBackground);

        // Add cell to designated group
        document.getElementById(`compact_${weekString}`).appendChild(cellContainer);

    };


    // Create a wide (UI) challenge
    function createWideChallenge(challengeData, weekString, isRedacted) {

        // Check if challenge is redacted
        if (isRedacted) {
            return;
        };

        // Create new elements (excluding ones that might occur more than once)
        const cellContainer = document.createElement('div');
        const cellTopHalf = document.createElement('div');
        const cellMainIcon = document.createElement('img');
        const cellHeaderContainer = document.createElement('div');
        const cellTextTitleWrapper = document.createElement('div');
        const cellTextTitleContent = document.createElement('div');
        const cellTextDescriptorWrapper = document.createElement('div');
        const cellTextDescriptorContent = document.createElement('div');
        const cellBotHalf = document.createElement('div');
        const cellRewardsContainer = document.createElement('div');
        
        // Assign classes
        cellContainer.classList = 'cell wide';
        cellTopHalf.classList = 'cellTopHalf_wide';
        cellMainIcon.classList = 'cellIconMain_wide';
        cellHeaderContainer.classList = 'cellHeaderContainer_wide';
        cellTextTitleWrapper.classList = 'cellTextWrapper_wide';
        cellTextTitleContent.classList = 'cellTextContent_wide';
        cellTextDescriptorWrapper.classList = 'cellTextWrapper_wide cellDescriptor_wide';
        cellTextDescriptorContent.classList = 'cellTextContent_wide cellTextContentDescriptor_wide';
        cellBotHalf.classList = 'cellBotHalf_wide';
        cellRewardsContainer.classList = 'cellRewards_wide';

        // Add content (src,href,innerHTML) to elements
        cellMainIcon.src = `https://bungie.net${challengeData.displayProperties.icon}`;
        cellTextTitleContent.innerHTML = challengeData.displayProperties.name;
        cellTextDescriptorContent.innerHTML = challengeData.displayProperties.description;

        // Loop over challenge rewards, do same process
        for (let reward of challengeData.rewardItems) {

            // Create elements
            const rewardDefinition = itemDefinitions[reward.itemHash];
            const rewardContainer = document.createElement('div');
            const rewardIcon = document.createElement('img');
            const rewardName = document.createElement('div');

            // Assign classes
            rewardContainer.classList = 'rewardContainer_wide';
            rewardIcon.classList = 'rewardIcon_wide';
            
            // Add content (src,href,innerHTML) to elements
            rewardIcon.src = `https://bungie.net${rewardDefinition.displayProperties.icon}`;
            rewardName.innerHTML = rewardDefinition.displayProperties.name;

            // Form hierarchy, add to hierachy
            rewardContainer.append(rewardIcon, rewardName);
            cellRewardsContainer.appendChild(rewardContainer);
        };

        // Loop over challenge objectives, do same process
        for (let objective of challengeData.objectives) {

            // Create elements
            const objectiveDefinition = objectiveDefinitions[objective.objectiveHash];
            const cellProgressContainer = document.createElement('div');
            const cellProgressBoxOuter = document.createElement('div');
            const cellProgressBoxSpacer = document.createElement('div');
            const cellProgressBoxInner = document.createElement('div');
            const cellProgressBarContainer = document.createElement('div');
            const cellProgressBarLeftText = document.createElement('div');
            const cellProgressBarRightText = document.createElement('div');

            // Assign classes
            cellProgressContainer.classList = 'cellProgressContainer_wide';
            cellProgressBoxOuter.classList = 'cellProgressBoxOuter_wide';
            cellProgressBoxSpacer.classList = 'cellProgressBoxSpacer_wide';
            cellProgressBoxInner.classList = 'cellProgressBoxInner_wide';
            cellProgressBarContainer.classList = 'cellProgressBar_wide';

            // Add content (src,href,innerHTML) to elements
            cellProgressBarLeftText.innerHTML = objectiveDefinition.progressDescription;
            cellProgressBarRightText.innerHTML = `${objective.progress}/${objective.completionValue}`;

            // Check if objective progressDescription is empty
            if (objectiveDefinition.progressDescription === '') {
                cellProgressBarLeftText.innerHTML = 'Progress';
            };

            // Check if objective is complete
            if (objective.progress >= objective.completionValue) {

                // Change progress box style
                cellProgressBoxInner.style.backgroundColor = '#3A826E';
                cellProgressBoxOuter.style.border = '1px solid #9A9A9A';
            }
            else if (!(objective.progress >= objective.comletionValue)) {
                
                // Change text style
                cellProgressBarLeftText.style.color = 'white';
                cellProgressBarRightText.style.color = 'white';
            };

            // Form hierachy, add to hierarchy
            cellProgressBoxSpacer.appendChild(cellProgressBoxInner);
            cellProgressBoxOuter.appendChild(cellProgressBoxSpacer);
            cellProgressBarContainer.append(cellProgressBarLeftText, cellProgressBarRightText);
            cellProgressContainer.append(cellProgressBoxOuter, cellProgressBarContainer);
            cellBotHalf.appendChild(cellProgressContainer);
        };

        // Change style of cell container, based on isClaimed property
        if (!challengeData.isClaimed && challengeData.isComplete) {
            cellContainer.classList = 'cellClaimable wide';
        }
        else if (challengeData.isClaimed && challengeData.isComplete) {
            cellContainer.classList = 'cellCompleted wide';
        };

        // Build top section with main icon, name and descriptor
        cellTextTitleWrapper.append(cellTextTitleContent);
        cellTextDescriptorWrapper.append(cellTextDescriptorContent);
        cellHeaderContainer.append(cellTextTitleWrapper, cellTextDescriptorWrapper);

        // Append each sub container to cell
        cellTopHalf.append(cellMainIcon, cellHeaderContainer);
        cellBotHalf.append(cellRewardsContainer);
        cellContainer.append(cellTopHalf, cellBotHalf);

        // Add cell to designated group
        document.getElementById(`wide_${weekString}`).appendChild(cellContainer);

    };

    // Run functions
    createWideChallenge(challengeData, weekString, isRedacted);
    createCompactChallenge(challengeData, weekString, isRedacted);
};
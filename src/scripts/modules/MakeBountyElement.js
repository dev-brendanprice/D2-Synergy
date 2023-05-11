import { itemDisplay, log } from '../user.js';
import { ReplaceNamedStringVariables } from './ReplaceNamedStringVariables.js';


// Make element for entry data when hash is found in itemDefinitions
// @object {param}
export async function MakeBountyElement(param) {

    let itemObjectivesContainer = document.createElement('div');
    let itemOverlay = document.createElement('div');
    let itemContainer = document.createElement('div');
    let itemHeader = document.createElement('div');
    let itemAttributes = document.createElement('div');
    let itemStatus = document.createElement('img');
    let itemTitle = document.createElement('div');
    let itemType = document.createElement('div');
    let itemDesc = document.createElement('div');
    let item = document.createElement('img');
    let itemPrgCon = document.createElement('div');
    let itemPrg = document.createElement('div');

    // itemContainer style
    itemContainer.className = 'itemContainer';
    itemContainer.id = `itemContainer_${param.hash}`;

    // Item status e.g. completed or expired
    itemStatus.classList += 'statusIcon';

    // Create progress bar
    itemPrgCon.className = 'bountyProgressBarContainer';
    itemPrg.className = 'bountyProgressBar';
    itemPrgCon.appendChild(itemPrg);

    // Create image element
    item.className = 'bounty';
    item.id = `bounty_${param.hash}`;
    item.src = `https://www.bungie.net${param.displayProperties.icon}`;
    item.style.width = `${itemDisplay.itemDisplaySize}px`;

    // Div hierarchy
    itemContainer.appendChild(item);
    document.querySelector('#bountyItems').appendChild(itemContainer);

    // Create overlay element
    itemOverlay.className = `overlayContainer`;
    itemOverlay.id = `item_${param.hash}`;
    document.querySelector('#overlays').appendChild(itemOverlay);

    // Progress descriptors container
    itemObjectivesContainer.className = 'itemObjectivesContainer';

    // Prop content of item
    itemHeader.className = 'itemHeader';
    itemTitle.id = 'itemTitle';
    itemType.id = 'itemType';
    itemDesc.id = 'itemDesc';
    itemAttributes.className = 'itemAttributes';
    itemTitle.innerHTML = param.displayProperties.name;
    itemType.innerHTML = param.itemTypeDisplayName;

    // Reformat item description to include a breakline when a sentence ends
    let itemDescriptionSplit = (param.displayProperties.description).split('.');
    itemDesc.innerHTML = `${itemDescriptionSplit[0]}. <br><br>${itemDescriptionSplit[1]}`;
    // itemDesc.innerHTML = itemDescriptionSplit[0] + '.' + '<br>' + itemDescriptionSplit[1];

    // Assign content to parent
    itemHeader.append(itemTitle, itemType);
    document.querySelector(`#item_${param.hash}`).append(itemHeader);

    // Create item progress and push to DOM
    let rootIndex = param.objectiveDefinitions;
    let completionCounter = 0;
    let completionProgressPercentage = 0;
    let completionPercentage = 0;


    for (let indexCount = 0; indexCount < rootIndex.length; indexCount++) {

        let itemPrgCounter = document.createElement('div');
        let itemPrgDesc = document.createElement('div');
        let objectiveContainer = document.createElement('div');
        let objectiveCheckbox = document.createElement('div');
        let objectiveCheckboxOuter = document.createElement('div');
        let objectiveCheckboxMiddle = document.createElement('div');
        let objectiveCheckboxInner = document.createElement('div');

        // Replace named variables for their respective icons
        ReplaceNamedStringVariables(rootIndex[indexCount].progressDescription);

        // Check if progess string exceeds char limit
        if (rootIndex[indexCount].progressDescription.length >= 24) {

            let rt = rootIndex[indexCount].progressDescription.slice(0, 24); // Limit string to 24 chars
            if (rt.charAt(rt.length - 1) === ' ') {
                rt = rt.slice(0, rt.length - 1); // Remove deadspaces at the end of strings
            };
            rootIndex[indexCount].progressDescription = rt + '..';
        };

        // Give item progress attributes their style
        itemPrgCounter.className = 'itemPrgCounter';
        itemPrgDesc.className = 'itemPrgDesc';
        itemPrgCounter.id = `prgCounter_${rootIndex[indexCount].hash}`;
        itemPrgDesc.id = `prgDesc_${rootIndex[indexCount].hash}`;

        // Create objective checkboxes
        objectiveContainer.className = 'objectiveContainer';
        objectiveCheckboxOuter.className = 'objectiveCheckboxOuter';
        objectiveCheckboxOuter.id = `Outer_${rootIndex[indexCount].hash}`;
        objectiveCheckboxMiddle.className = 'objectiveCheckboxMiddle';
        objectiveCheckboxMiddle.id = `Middle_${rootIndex[indexCount].hash}`;
        objectiveCheckboxInner.className = 'objectiveCheckboxInner';
        objectiveCheckboxInner.id = `Inner_${rootIndex[indexCount].hash}`;
        objectiveCheckboxOuter.appendChild(objectiveCheckboxMiddle);
        objectiveCheckboxMiddle.appendChild(objectiveCheckboxInner);
        objectiveCheckbox.appendChild(objectiveCheckboxOuter);

        // Add checkbox and item progress to flex container
        objectiveContainer.append(objectiveCheckbox, itemPrgDesc, itemPrgCounter);
        itemObjectivesContainer.append(objectiveContainer);

        itemAttributes.appendChild(itemDesc);
        itemAttributes.appendChild(itemObjectivesContainer);
        document.querySelector(`#item_${param.hash}`).appendChild(itemAttributes);

        // Item objective progress
        itemPrgDesc.innerHTML = rootIndex[indexCount].progressDescription;
        param.progress.forEach(v => {
            if (v.objectiveHash === rootIndex[indexCount].hash) {

                // Objective progress
                if (rootIndex[indexCount].completionValue === 100) {
                    itemPrgCounter.innerHTML = `${v.progress}%`;
                    completionProgressPercentage += v.progress;
                    completionPercentage += v.completionValue;
                }
                else if (rootIndex[indexCount].completionValue !== 100) {
                    itemPrgCounter.innerHTML = `${v.progress}/${v.completionValue}`;
                    completionProgressPercentage += v.progress;
                    completionPercentage += v.completionValue;
                };

                // Check if objective is completed
                if (v.complete) {
                    completionCounter++;
                    document.getElementById(`Outer_${v.objectiveHash}`).style.border = '1.5px solid var(--completedCheckboxOuter)';
                    document.getElementById(`Middle_${v.objectiveHash}`).style.border = '1.5px solid var(--completedCheckboxMiddle)';
                    document.getElementById(`Inner_${v.objectiveHash}`).style.backgroundColor = 'var(--completedCheckboxInner)';
                };
            };
        });
    };

    // Calculate total % progress
    let prg = Math.round((completionProgressPercentage / completionPercentage) * 100);
    itemPrg.style.width = `${prg}%`;

    // Check item completion status
    if (param.progress.length === completionCounter) {
        // Change areObjectivesComplete boolean
        param.areObjectivesComplete = true;

    }
    else if (param.progress.length !== completionCounter) {
        // Change areObjectivesComplete boolean
        param.areObjectivesComplete = false;
    };

    // Else, Mark item as expired
    if (param.isExpired && !param.areObjectivesComplete) {
        itemStatus.classList += ` expire`;
        itemStatus.id = `expire_${param.hash}`;
        itemStatus.src = './static/ico/destiny-icons/pursuit_expired.svg';
        document.getElementById(`bounty_${param.hash}`).style.border = '1px solid rgba(179,73,73, 0.749)';
    }
    else if (param.areObjectivesComplete) {
        itemStatus.classList += ` complete`;
        itemStatus.id = `complete_${param.hash}`;
        itemStatus.src = './static/ico/destiny-icons/pursuit_completed.svg';
        document.getElementById(`bounty_${param.hash}`).style.border = '1px solid rgba(182,137,67, 0.749)';
        itemPrgCon.style.display = 'none';
    };

    // Append the item status and progress
    itemContainer.append(itemStatus, itemPrgCon);

    // Watch for mouse move event (when mouse hovers over bounty element)
    itemContainer.addEventListener('mousemove', function (e) {

        itemOverlay.style.position = 'absolute';
        itemOverlay.style.display = 'block';

        itemOverlay.style.left = `${e.pageX}px`;
        itemOverlay.style.top = `${e.pageY}px`;

    });

    itemContainer.addEventListener('mouseleave', (e) => {
        itemOverlay.style.display = 'none';
    });
};
import { itemDisplay } from '../user.js';


// Make element for entry data when hash is found in itemDefinitions
// @object {param}
export async function MakeBountyElement(param) {

    let itemObjectivesContainer = document.createElement('div');
    let itemOverlay = document.createElement('div');
    let itemStatus = document.createElement('img');
    let itemTitle = document.createElement('div');
    let itemType = document.createElement('div');
    let itemDesc = document.createElement('div');
    let item = document.createElement('img');
    let hr = document.createElement('hr');

    // Create bottom element
    item.className = `bounty`;
    item.id = `bounty_${param.hash}`;
    item.src = `https://www.bungie.net${param.displayProperties.icon}`;
    item.style.width = `${itemDisplay.itemDisplaySize}px`;
    document.querySelector('#bountyItems').appendChild(item);

    // Create overlay element
    itemOverlay.className = `itemContainer`;
    itemOverlay.id = `item_${param.hash}`;
    document.querySelector('#overlays').appendChild(itemOverlay);

    // Progress descriptors container
    itemObjectivesContainer.className = 'itemObjectivesContainer';

    // Prop content of item
    itemTitle.id = 'itemTitle';
    itemType.id = 'itemType';
    itemDesc.id = 'itemDesc';
    itemTitle.innerHTML = param.displayProperties.name;
    itemType.innerHTML = param.itemTypeDisplayName;
    itemDesc.innerHTML = param.displayProperties.description;

    // Assign content to parent
    document.querySelector(`#item_${param.hash}`).append(itemTitle, itemType, hr, itemDesc);

    // Create item progress and push to DOM
    let rootIndex = param.objectiveDefinitions, completionCounter = 0;

    for (let indexCount = 0; indexCount < rootIndex.length; indexCount++) {

        let itemPrgContainer = document.createElement('div');
        let itemPrgCounter = document.createElement('div'); 
        let itemPrgDesc = document.createElement('div');

        // Check if progess string exceeds char limit
        if (rootIndex[indexCount].progressDescription.length >= 24) {

            let rt = rootIndex[indexCount].progressDescription.slice(0, 24); // Limit string to 24 chars
            if (rt.charAt(rt.length - 1) === ' ') {
                rt = rt.slice(0, rt.length - 1); // Remove deadspaces at the end of strings
            };
            rootIndex[indexCount].progressDescription = rt + '..';
        };

        itemPrgContainer.className = 'itemPrgContainer';
        itemPrgCounter.className = 'itemPrgCounter';
        itemPrgDesc.className = 'itemPrgDesc';
        itemPrgCounter.id = `prgCounter_${rootIndex[indexCount].hash}`;
        itemPrgDesc.id = `prgDesc_${rootIndex[indexCount].hash}`;

        itemPrgContainer.appendChild(itemPrgDesc);
        itemPrgContainer.appendChild(itemPrgCounter);
        itemObjectivesContainer.appendChild(itemPrgContainer);
        document.querySelector(`#item_${param.hash}`).appendChild(itemObjectivesContainer);

        // Render item objective progress
        itemPrgDesc.innerHTML = rootIndex[indexCount].progressDescription;
        param.progress.forEach(h => {
            if (h.objectiveHash === rootIndex[indexCount].hash) {

                // Render objective progress
                if (rootIndex[indexCount].completionValue === 100) {
                    itemPrgCounter.innerHTML = `${h.progress}%`;
                }
                else if (rootIndex[indexCount].completionValue !== 100) {
                    itemPrgCounter.innerHTML = `${h.progress}/${h.completionValue}`;
                };

                // Check if objective is completed
                if (h.complete) {
                    completionCounter++;
                };
            };
        });
    };

    // Mark item as complete
    if (param.progress.length === completionCounter) {
        // Change areObjectivesComplete boolean
        param.areObjectivesComplete = true;
    }
    else if (param.progress.length !== completionCounter) {
        // Change areObjectivesComplete boolean
        param.areObjectivesComplete = false;
    };

    // Mark item as expired
    if (param.isExpired && !param.areObjectivesComplete) {

        // Change style to represent state
        itemStatus.className = `expire`;
        itemStatus.id = `expire_${param.hash}`;
        itemStatus.src = './static/ico/pursuit_expired.svg';
        document.getElementById(`bounty_${param.hash}`).style.border = '1px solid rgba(179,73,73, 0.749)';
    }
    else if (param.areObjectivesComplete) {
        itemStatus.className = `complete`;
        itemStatus.id = `complete_${param.hash}`;
        itemStatus.src = './static/ico/pursuit_completed.svg';
        document.getElementById(`bounty_${param.hash}`).style.border = '1px solid rgba(182,137,67, 0.749)';
    };

    // Append the item status to the item
    document.querySelector(`#bountyItems`).append(itemStatus);

    // Watch for mouse events
    item.addEventListener('mousemove', function (e) {

        itemOverlay.style.position = 'absolute';
        itemOverlay.style.display = 'block';

        let itemOverlayPos = parseInt(itemOverlay.style.left.split('px')[0]);
        let itemOverlayWidth = 210;
        if (!(itemOverlayPos + itemOverlayWidth >= window.innerWidth)) {
            itemOverlay.style.left = `${e.pageX}px`;
            itemOverlay.style.top = `${e.pageY}px`;
        }
        else {
            itemOverlay.style.left = `1070px`;
            itemOverlay.style.top = `${e.pageY}px`;
        };
    });

    item.addEventListener('mouseleave', (e) => {
        itemOverlay.style.display = 'none';
    });
};
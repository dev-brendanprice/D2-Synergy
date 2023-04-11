
// Make a character select that is displayed on the top left
// @object {info}
export function MakeCharacterSelect (info) {

    // Make div elements
    let characterSelect = document.createElement('div');
    let characterBg = document.createElement('div');
    let characterClassIco = document.createElement('img');
    let characterEmblemIco = document.createElement('img');
    let characterInfo = document.createElement('div');
    let characterClass = document.createElement('div');
    let characterRace = document.createElement('div');
    let characterPowerCon = document.createElement('div');
    let powerIcon = document.createElement('img');
    let characterPower = document.createElement('div');

    // Add css classes (style) to div elements
    characterSelect.className = 'characterSelect';
    characterBg.className = 'characterBg';
    characterClassIco.className = 'characterClassIco';
    characterEmblemIco.className = 'characterEmblemIco';
    characterInfo.className = 'characterInfo';
    characterClass.className = 'characterClass';
    characterRace.className = 'characterRace';
    characterPowerCon.className = 'characterPowerCon';
    powerIcon.className = 'powerIcon';
    characterPower.className = 'characterPower';

    // Add hierarchy to div elements
    characterBg.appendChild(characterClassIco);
    characterSelect.appendChild(characterBg);
    characterSelect.appendChild(characterEmblemIco);
    characterInfo.appendChild(characterClass);
    characterInfo.appendChild(characterRace);
    characterSelect.appendChild(characterInfo);
    characterPowerCon.appendChild(powerIcon);
    characterPowerCon.appendChild(characterPower);
    characterSelect.appendChild(characterPowerCon);

    // Add values (and data attr) to corresponding div elements
    characterEmblemIco.src = `https://www.bungie.net${info.emblemIco}`;
    characterClass.innerHTML = info.characterClass;
    characterRace.innerHTML = info.characterRace;
    characterPower.innerHTML = info.characterPower;
    characterSelect.dataset.characterId = info.characterId;
    powerIcon.src = 'static/ico/destiny-icons/power2.svg';

    // Check character class and change div elements
    if (info.characterClass === 'Titan') {

        characterClassIco.src = 'static/ico/destiny-icons/class_titan.svg';
        characterClassIco.style.filter = 'invert(21%) sepia(47%) saturate(1408%) hue-rotate(317deg) brightness(100%) contrast(90%)';
        characterBg.style.background = 'linear-gradient(90deg,#89323800 50%,#89323866)';
    }
    else if (info.characterClass === 'Warlock') {

        // Warlock requires some custom styling
        characterClassIco.src = 'static/ico/destiny-icons/class_warlock.svg';
        characterClassIco.style.filter = 'invert(63%) sepia(26%) saturate(1130%) hue-rotate(6deg) brightness(87%) contrast(87%)';
        characterClassIco.style.marginTop = '-30px';
        characterClassIco.style.marginRight = '27px';
        characterClassIco.style.width = '50%';
        characterBg.style.background = 'linear-gradient(90deg,#b68f2800 50%,#b68f2866)';
    }
    else if (info.characterClass === 'Hunter') {

        characterClassIco.src = 'static/ico/destiny-icons/class_hunter.svg';
        characterClassIco.style.filter = 'invert(50%) sepia(44%) saturate(267%) hue-rotate(144deg) brightness(87%) contrast(85%)';
        characterBg.style.background = 'linear-gradient(90deg,#5c828b00 50%,#5c828b66)';
    };

    // Add parent element to DOM (defaultCharacterSelect)
    document.getElementById('defaultCharacterSelect').appendChild(characterSelect);

};

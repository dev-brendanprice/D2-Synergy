import { HomeURL } from '../../../appKeys.js';

const log = console.log.bind(console);


// Check if state query parameter exists in URL
const VerifyState = async () => {

    var urlParams = new URLSearchParams(window.location.search),
        state = urlParams.get('state');

    if (state != window.localStorage.getItem('stateCode')) {
        window.localStorage.clear();
        window.sessionStorage.clear();
        window.location.href = `${HomeURL}`;
    }
    else {
        window.localStorage.removeItem('stateCode');
    };
};


// Redirect user back to specified url
// @string {url}, @string {param}
const RedirUser = (url, param) => {
    window.location.href = `${url}?${param ? param : ''}`;
};


// Returns corresponding class name using classType
// @int {classType}
const parseChar = (classType) => {
    var r;
    switch (classType) {
        case 0:
            r='Titan';
            break;
        case 1:
            r='Hunter';
            break;
        case 2:
            r='Warlock';
            break;
        default:
            console.error('could not parse character, parseChar() @function');
    };
    return r;
};


// Make element for entry data when hash is found in definitions
// @obj {param}
const MakeBountyElement = (param) => {

    const item = document.createElement('img'),
          itemOverlay = document.createElement('div'),
          itemTitle = document.createElement('div'),
          itemType = document.createElement('div'),
          itemDesc = document.createElement('div'),
          hr = document.createElement('hr');


    // Create bottom element
    item.className = `bounty`;
    item.id = `${param.hash}`;
    document.querySelector('#items').appendChild(item);
    item.src = `https://www.bungie.net${param.displayProperties.icon}`;

    // Create overlay element
    itemOverlay.className = `itemContainer`;
    itemOverlay.id = `item_${param.hash}`;
    document.querySelector('#overlays').appendChild(itemOverlay);

    // Prop content of item
    itemTitle.id = 'itemTitle';
    itemType.id = 'itemType';
    itemDesc.id = 'itemDesc';
    itemTitle.innerHTML = param.displayProperties.name;
    itemType.innerHTML = param.itemTypeDisplayName;
    itemDesc.innerHTML = param.displayProperties.description;

    // Assign content to parent
    document.querySelector(`#item_${param.hash}`).appendChild(itemTitle);
    document.querySelector(`#item_${param.hash}`).appendChild(itemType);
    document.querySelector(`#item_${param.hash}`).appendChild(hr);
    document.querySelector(`#item_${param.hash}`).appendChild(itemDesc);
    

    // Watch for mouse events
    item.addEventListener('mousemove', (e) => {
        let el = itemOverlay.style;
        el.display = 'inline-block';
        el.left = `${e.pageX}px`;
        el.top = `${e.pageY}px`;
    });

    item.addEventListener('mouseleave', (e) => {
        itemOverlay.style.display = 'none';
    });
};


// Start loading sequence
const StartLoad = () => {
    document.getElementById('slider').style.display = 'block';
};


// Stop loading sequence
const StopLoad = () => {
    document.getElementById('slider').style.display = 'none';
};


// Log user out on request
const Logout = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = `${HomeURL}`;
};


// Seperate numbers using commas
const InsertSeperators = (num) => {
    return `${num}`.split()[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};



export {
  parseChar,
  Logout,
  StartLoad,
  StopLoad,
  MakeBountyElement,
  RedirUser,
  InsertSeperators,
  VerifyState
};
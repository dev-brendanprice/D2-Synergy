import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import Form from 'react-bootstrap/Form';
import {useState, useEffect} from "react";
import {get} from "idb-keyval";
import filterSealsBySearch from "../lib/filterSeals.js";
import QuestionIcon from "../static/question-icon.svg";
import TitlesSort from "./TitlesSort.jsx";

function TitleSelector({profiles, searchParams, setSearchParams}) {

    // store two state variables so we can revert the filtered list when the input box is empty etc.
    const [ originalSealsArray, setOriginalSealsArray ] = useState([]); // copy of original, dont change
    const [ mutableSealsArray, setMutableSealsArray ] = useState([]); // change this one instead
    const [ showUnobtainable, setShowUnobtainable ] = useState(false);
    const [ activeSort, setActiveSort ] = useState("Progress");
    // sorts: "Progress" (default, sorts by roster-wide progress), "ABC" (alphabetical)
    // I could use 0,1,2 or True,False for this, but the dropdown label *is* the same as the sort name/string

    // get DestinySeals from idb (async)
    useEffect(() => {
        get('DestinySeals').then(data => {
                setOriginalSealsArray(data);
                setMutableSealsArray(data);
            });
    }, []);

    return <div className="seals-selector-container">
        <div>
            <input className="seal-selector-search" type="text" placeholder="Search seals.."
               onChange={el => {
                   filterSealsBySearch(el.target.value, {
                       originalSealsArray, mutableSealsArray, setMutableSealsArray
                   })
               }}/>
            <div className="seal-selector-text">Selected seal: {searchParams.get("seal")}</div>
        </div>
        <div className="seals-selector-filters-container">
            <TitlesSort activeSort={activeSort} setActiveSort={setActiveSort} mutableSealsArray={mutableSealsArray}
                        setMutableSealsArray={setMutableSealsArray} profiles={profiles} />
            <div className="seals-selector-toggles">
                <Form.Check type="switch" id="seal-selector-switch" label="show unobtainable"
                            onChange={(e) => { setShowUnobtainable(e.target.checked) }} />
                <OverlayTrigger placement="top" container={document.body} overlay={
                    <Tooltip>Some titles are tied to a specific event, meaning they're no longer obtainable
                        after monument of triumph</Tooltip> }>
                    <img className="seals-toggle-icon" src={QuestionIcon} />
                </OverlayTrigger>
            </div>
        </div>
        <div className="seals-list">
            {mutableSealsArray?.map(seal => (
                <OverlayTrigger key={seal.hash} placement="bottom" container={document.body}
                    overlay={ <Tooltip>{seal.displayProperties.uiName}</Tooltip> }>

                    <img className={"seal-icon" +
                                    (searchParams.get("seal") === seal.displayProperties.uiName ? " active-seal" : "") +
                                    (!seal.isObtainable && !showUnobtainable ? " not-obtainable" : " not-obtainable-show")
                                }
                        src={`https://www.bungie.net${seal.originalIcon}`} alt={seal.displayProperties.uiName}
                        onClick={() => setSearchParams({ seal: seal.displayProperties.uiName })} />

                </OverlayTrigger>
            ))}
        </div>
    </div>
}

export default TitleSelector;
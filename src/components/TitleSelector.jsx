import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import Form from 'react-bootstrap/Form';
import {useState, useEffect} from "react";
import {get} from "idb-keyval";
import filterSealsBySearch from "../lib/filterSeals.js";
import QuestionIcon from "../assets/question-icon.svg";

function TitleSelector({searchParams, setSearchParams}) {

    // store two state variables so we can revert the filtered list when the input box is empty etc.
    const [ originalSealsArray, setOriginalSealsArray ] = useState([]);
    const [ mutableSealsArray, setMutableSealsArray ] = useState([]);
    const [ showUnobtainable, setShowUnobtainable ] = useState(false);

    // get DestinySeals from idb (async)
    useEffect(() => {
        get('DestinySeals').then(data => {
                setOriginalSealsArray(data);
                setMutableSealsArray(data);
            });
    }, []);

    return (
        <div className="seals-selector-container">
            <div>
                <input className="seal-selector-search" type="text" placeholder="Search seals.."
                   onChange={el => {
                       filterSealsBySearch(el.target.value, {
                           originalSealsArray, mutableSealsArray, setMutableSealsArray
                       })
                   }}/>
                <div className="seal-selector-text">Selected seal: {searchParams.get("seal")}</div>
            </div>
            <div className="seals-selector-toggles">
                <Form.Check type="switch" id="custom-switch" label="show unobtainable" 
                            onChange={(e) => { setShowUnobtainable(e.target.checked) }} />
                <OverlayTrigger placement="top" container={document.body} overlay={ <Tooltip>Some titles were time-gated 
                    to a specific event, meaning they're no longer obtainable.</Tooltip> }>
                    <img className="seals-toggle-icon" src={QuestionIcon} />
                </OverlayTrigger>
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
    )
}

export default TitleSelector;
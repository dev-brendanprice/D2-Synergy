import {useMemo, useState} from "react";
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import Form from 'react-bootstrap/Form';
import useDestinySeals from "../hooks/useDestinySeals.js";
import aggregateTriumphs from "../lib/aggregateTriumphs.js";
import PersonIcon from '../../public/person-icon.svg';
import TriumphCounter from "./TriumphCounter.jsx";

function TitleTriumphs({profiles, searchParams}) {

    const [ showCompleted, setShowCompleted ] = useState(false);
    const destinySeals = useDestinySeals();

    // get & save selected seal
    const { selectedSeal, triumphCompletions } = useMemo(() => {

        const sealNameInQueryParam = searchParams.get("seal");
        // return destinySeals.find(seal => seal?.displayProperties?.uiName === sealNameInQueryParam);

        return {
            selectedSeal: destinySeals.find(seal => seal?.displayProperties?.uiName === sealNameInQueryParam),
            triumphCompletions: aggregateTriumphs(profiles, destinySeals),
        }
    }, [profiles, searchParams, destinySeals]);

    return (
        <div className="compare-container">
            <h5>Triumphs:</h5>
            <Form.Check type="switch" id="show-completed-toggled" label="show completed"
                onChange={(e) => {setShowCompleted(e.target.checked)}} />
            <div className="triumphs-outer-container">
                {selectedSeal?.children?.records?.map(seal => {
                    // console.log(triumphCompletions[seal.hash], Object.keys(profiles).length);
                    return (
                        <div className={!showCompleted && triumphCompletions[seal.hash].amountOfCompletions === Object.keys(profiles).length ?
                            "triumph-container show-completed" : "triumph-container"} key={seal.hash} >
                            <div className="triumph-attrs-container">
                                <img className="triumph-icon"
                                 src={`https://www.bungie.net${seal?.displayProperties?.icon}`} />
                                <div className="triumph-text">
                                    <div>{seal?.displayProperties?.name}</div>
                                    <hr className="triumph-divider" />
                                    <OverlayTrigger placement="top" container={document.body}
                                                    overlay={ <Tooltip>{seal?.displayProperties?.description}</Tooltip> }>
                                        <div className="triumph-description">{seal?.displayProperties?.description}</div>
                                    </OverlayTrigger>
                                </div>
                            </div>
                            <div className="triumph-counter-container">
                                <TriumphCounter triumphCompletions={triumphCompletions} profiles={profiles} seal={seal} />
                                <img className="triump-counter-icon" src={PersonIcon} />
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default TitleTriumphs;
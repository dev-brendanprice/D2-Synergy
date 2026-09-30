import {useMemo, useState} from "react";
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import Form from 'react-bootstrap/Form';
import useDestinySeals from "../hooks/useDestinySeals.js";
import aggregateTriumphs from "../lib/aggregateTriumphs.js";
import PersonIcon from '../static/person-icon.svg';
import WarningIcon from '../static/warning-icon.svg';
import TriumphCounter from "./TriumphCounter.jsx";

function TitleTriumphs({profiles, searchParams}) {

    const [ showCompleted, setShowCompleted ] = useState(false);
    const destinySeals = useDestinySeals();

    // get & save selected seal
    const { selectedSeal, triumphCompletions } = useMemo(() => {
        const sealNameInQueryParam = searchParams.get("seal");
        return {
            selectedSeal: destinySeals.find(seal => seal?.displayProperties?.uiName === sealNameInQueryParam),
            triumphCompletions: aggregateTriumphs(profiles, destinySeals),
        }
    }, [profiles, searchParams, destinySeals]);

    return <div className={selectedSeal ? "compare-container" : "compare-container hide"}>
        <h5>Triumphs:</h5>
        <div className="show-complete-toggle-container">
            <Form.Check type="switch" id="show-completed-toggled" label="show completed"
                        onChange={(e) => {setShowCompleted(e.target.checked)}} />

            <OverlayTrigger placement="top" container={document.body}
                            overlay={ <Tooltip>Some [or all] triumphs within this title have been completed; these are
                                hidden by default</Tooltip> }>
                <div className={showCompleted ? "show-completed show-complete-warning" : "show-complete-warning"}>
                    <img src={WarningIcon} className="warning-icon" />
                    <div>Triumphs are being hidden</div>
                </div>
            </OverlayTrigger>

        </div>
        <div className="triumphs-outer-container">
            {selectedSeal?.children?.records?.map(seal => {
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
}

export default TitleTriumphs;
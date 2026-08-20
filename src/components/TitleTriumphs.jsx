import {useMemo} from "react";
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import useDestinySeals from "../hooks/useDestinySeals.js";
import aggregateTriumphs from "../lib/aggregateTriumphs.js";
import PersonIcon from '../assets/person-icon.svg';
import TriumphCounter from "./TriumphCounter.jsx";

function TitleTriumphs({profiles, searchParams}) {
    const destinySeals = useDestinySeals();

    // get & save selected seal
    const selectedSeal = useMemo(() => {
        const sealNameInQueryParam = searchParams.get("seal");
        return destinySeals.find(seal => seal?.displayProperties?.uiName === sealNameInQueryParam);
    }, [searchParams, destinySeals])

    // iterate over profiles
    // iterate over seals
    // iterate over triumphs
    // has this profile completed this triumph?
    //     yes +1, no return

    const triumphCompletions = useMemo(() => {
        return aggregateTriumphs(profiles, destinySeals);
    }, [profiles, destinySeals]);
    console.log(triumphCompletions);

    return (
        <div className="compare-container">
            <h5>Triumphs:</h5>
            <div className="triumphs-outer-container">
                {selectedSeal?.children?.records?.map(seal => {
                    return (
                        <div className="triumph-container" key={seal.hash}>
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
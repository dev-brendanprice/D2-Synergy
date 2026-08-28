import Tooltip from 'react-bootstrap/Tooltip';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import {PlatformIcons} from "../lib/manifest.js";


function TriumphCounter({ triumphCompletions, profiles, seal}) {

    // different message depending on if all guardians or some have completed a triumph 
    const overlayMessage = triumphCompletions[seal?.hash]?.profilesThatDidNotComplete.length ?
        <Tooltip>
            <strong>incomplete: </strong>
            {triumphCompletions[seal.hash]?.profilesThatDidNotComplete?.map(profile => {
                return (
                    <div key={profile.profile.mid}>
                        <img src={PlatformIcons[profile.profile.mtype]} />
                        {profile?.profile?.name}
                    </div>
                )
            })}
        </Tooltip> :
        <Tooltip>All guardians completed</Tooltip>

    return <OverlayTrigger placement="top" container={document.body} overlay={overlayMessage}>
        <div className="triumph-counter">
            { triumphCompletions[seal?.hash]?.amountOfCompletions }/
            { Object.entries(profiles || {}).length }
        </div>
    </OverlayTrigger>
}

export default TriumphCounter;
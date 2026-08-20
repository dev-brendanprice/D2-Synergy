import Tooltip from 'react-bootstrap/Tooltip';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';


function TriumphCounter({ triumphCompletions, profiles, item}) {

    // different message depending on if all guardians or some have completed a triumph 
    const overlayMessage = triumphCompletions[item?.hash]?.profilesThatDidNotComplete.length ?
        <Tooltip>
            <strong>incomplete: </strong>
            {triumphCompletions[item.hash]?.profilesThatDidNotComplete?.map(p => {
                return p?.profile?.bungieGlobalDisplayName
            }).join(", ")}
        </Tooltip> :
        <Tooltip>All guardians completed</Tooltip>

    return (
        <OverlayTrigger placement="top" container={document.body} overlay={overlayMessage}>
            <div className="triumph-counter">
                { triumphCompletions[item?.hash]?.amountOfCompletions }/
                { Object.entries(profiles || {}).length }
            </div>
        </OverlayTrigger>
    )
}

export default TriumphCounter;
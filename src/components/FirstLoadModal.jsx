import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

function FirstLoadModal(props) {
    return <Modal {...props} size="lg" aria-labelledby="contained-modal-title-vcenter" backdrop="static" centered>
        <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-vcenter">
                First time using this tool?
            </Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <h4>Greetings! 👋</h4>
            <p>
                This tool can be used to compare seal completion across a selection of
                guardians, making it easier for your group to decide what to grind next.
                <br />
                <br />
                Simply search for the players you want to compare, and select a seal;
                the tool will show you group progress for each triumph!
            </p>
        </Modal.Body>
        <Modal.Footer>
            <Button onClick={props.onHide}>Close</Button>
        </Modal.Footer>
    </Modal>
}

export default FirstLoadModal;
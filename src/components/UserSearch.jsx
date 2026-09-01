import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import {SearchForPlayer} from "../lib/playerSearch.js";
import Spinner from "../static/spinner-icon.svg";

function UserSearch({setSearchResults, setShowProfileSelector}) {

    async function handleSubmit(e) {
        e.preventDefault();

        // get entered text from field
        const formData = new FormData(e.target);
        const formDataObject = Object.fromEntries(formData.entries());
        if (!formDataObject.submittedString) return; // ignore empty submission

        document.getElementsByClassName("form-spinner")[0].classList.add("active"); // how the fuck else do I do this
        const searchResponse = await SearchForPlayer(formDataObject.submittedString);
        setSearchResults(searchResponse);
        setShowProfileSelector(true);
        document.getElementsByClassName("form-spinner")[0].classList.remove("active");
    }

    return <Form className="form-container" onSubmit={handleSubmit}>
        <Form.Control type="text" name="submittedString" placeholder="Guardian#1234" />
        <img className="form-spinner" src={Spinner} />
        <Button variant="primary" type="submit">
            Search
        </Button>
    </Form>
}

export default UserSearch

import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import {SearchForPlayer} from "../lib/playerSearch.js";
import Spinner from "../static/spinner-icon.svg";

function UserSearch({setSearchResults, setProfileSelect}) {

    async function handleSubmit(e) {
        e.preventDefault();

        // get entered text from field
        const formData = new FormData(e.target);
        const formDataObject = Object.fromEntries(formData.entries());
        if (!formDataObject.submittedUsername) return; // ignore empty submission

        document.getElementsByClassName("form-spinner")[0].classList.add("active"); // how the fuck else do I do this
        const searchResultsResponse = await SearchForPlayer(formDataObject.submittedUsername);
        setSearchResults(searchResultsResponse);
        document.getElementsByClassName("form-spinner")[0].classList.remove("active");
    }

    return (
        <>
            <Form className="form-container" onSubmit={handleSubmit}>
                <Form.Control type="text" name="submittedUsername" placeholder="guardian#0001"
                              defaultValue="brendanprice#4702" />
                <img className="form-spinner" src={Spinner} />
                <Button variant="primary" type="submit">
                    Search
                </Button>
            </Form>
        </>
    )
}

export default UserSearch

import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import {SearchPlayer} from "../lib/playerSearch.js";
import Spinner from "../assets/spinner-icon.svg";

function UserSearch({setSearchResults}) {

    // handles form submission
    async function handleSubmit(e) {
        e.preventDefault();
        document.getElementsByClassName("form-spinner")[0].classList.add("active");

        // get entered text from field
        const formData = new FormData(e.target);
        const formDataObj = Object.fromEntries(formData.entries());
        const results = await SearchPlayer(formDataObj.submittedUsername);
        setSearchResults(results); // search for player

        document.getElementsByClassName("form-spinner")[0].classList.remove("active");
    }

    return (
        <>
            <Form className="form-container" onSubmit={handleSubmit}>
                <Form.Control type="text" name="submittedUsername" placeholder="Search for player ..."
                              defaultValue="brendanprice" />
                <img className="form-spinner" src={Spinner} />
                <Button variant="primary" type="submit">
                    Search
                </Button>
            </Form>
        </>
    )
}

export default UserSearch

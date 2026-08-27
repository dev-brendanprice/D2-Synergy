import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import {SearchForPlayer} from "../lib/playerSearch.js";
import Spinner from "../../public/spinner-icon.svg";

function UserSearch({setSearchResults}) {

    async function handleSubmit(e) {
        e.preventDefault();
        document.getElementsByClassName("form-spinner")[0].classList.add("active");

        // get entered text from field
        const formData = new FormData(e.target);
        const formDataObject = Object.fromEntries(formData.entries());
        const searchResults = await SearchForPlayer(formDataObject.submittedUsername);
        console.log(searchResults);
        setSearchResults(searchResults);

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

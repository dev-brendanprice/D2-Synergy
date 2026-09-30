import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';

function TitlesSort({activeSort, setActiveSort}) {
    return (
        <DropdownButton id="dropdown-basic-button" title={activeSort}>
            <Dropdown.Item active={activeSort === "Progress"}
                           onClick={() => setActiveSort("Progress")}>Progress</Dropdown.Item>
            <Dropdown.Item active={activeSort === "ABC"}
                           onClick={() => setActiveSort("ABC")}>ABC</Dropdown.Item>
        </DropdownButton>
    )
}

export default TitlesSort;
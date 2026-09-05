import Dropdown from 'react-bootstrap/Dropdown';

function TitlesSort({activeSort, setActiveSort}) {
    return <Dropdown data-bs-theme="dark">
        <Dropdown.Toggle id="dropdown-button-dark-example1" variant="secondary">
            {activeSort}
        </Dropdown.Toggle>

        <Dropdown.Menu>
            <Dropdown.Item active={activeSort === "Progress"}
                           onClick={() => setActiveSort("Progress")}>Progress</Dropdown.Item>
            <Dropdown.Item active={activeSort === "ABC"}
                           onClick={() => setActiveSort("ABC")}>ABC</Dropdown.Item>
        </Dropdown.Menu>
    </Dropdown>
}

export default TitlesSort;
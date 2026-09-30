import Dropdown from 'react-bootstrap/Dropdown';
import SortIcon from '../static/sort-icon.svg';

function TitlesSort({activeSort, setActiveSort}) {
    return (
        <div>
            <Dropdown id="dropdown-basic-button" >
                <Dropdown.Toggle>
                    {activeSort}
                    <img src={SortIcon} />
                </Dropdown.Toggle>

                <Dropdown.Menu>
                    <Dropdown.Item active={activeSort === "Progress"}
                                   onClick={() => setActiveSort("Progress")}>Progress</Dropdown.Item>
                    <Dropdown.Item active={activeSort === "ABC"}
                                   onClick={() => setActiveSort("ABC")}>ABC</Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown>
        </div>
    )
}

export default TitlesSort;
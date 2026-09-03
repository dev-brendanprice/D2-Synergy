import Dropdown from 'react-bootstrap/Dropdown';
import {useEffect, useMemo} from "react";

function TitlesSort({activeSort, setActiveSort, mutableSealsArray, setMutableSealsArray, profiles}) {

    // calculate percent completed for roster as a whole
    // literally screw this code!11!11!!!!
    const numberOfProfiles = Object.values(profiles)?.length;
    mutableSealsArray.map(seal => {
        const totalPercentSHit = Object.values(profiles).reduce((sum, profile) => {
            const match = profile.seals.find(s => s.hash === seal.hash);
            return sum + (match ? match.completion.percentComplete : 0);
        }, 0);

        seal.rosterPercentComplete = numberOfProfiles > 0 ? totalPercentSHit / numberOfProfiles : 0;
    });

    const sortedSealsArrayByProgress = useMemo(() => {
        // sort
        return activeSort === "Progress" ? mutableSealsArray :
            mutableSealsArray.sort((a,b) => b.rosterPercentComplete - a.rosterPercentComplete);
    }, [activeSort, mutableSealsArray]);
    console.log(sortedSealsArrayByProgress);
    setMutableSealsArray(sortedSealsArrayByProgress);

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
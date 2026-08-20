import TitleSelector from "./TitleSelector.jsx";
import TitleTriumphs from "./TitleTriumphs.jsx";
import {useSearchParams} from "react-router-dom";

function TitleOverview({profiles}) {
    let [ searchParams, setSearchParams ] = useSearchParams();

    if (!Object.entries(profiles || {})?.length) { // return nothing if no profiles
        return <></>
    }

    return <>
        <TitleSelector searchParams={searchParams} setSearchParams={setSearchParams} />
        <TitleTriumphs profiles={profiles} searchParams={searchParams} />
    </>
}

export default TitleOverview;
import {get} from "idb-keyval";
import {useEffect, useState} from "react";

// get & save destiny seals; this avoids fetching this data every re-render
function useDestinySeals() {
    const [ destinySeals, setDestinySeals ] = useState([]);

    useEffect(() => {
        get('DestinySeals').then(setDestinySeals);
    }, []);

    return destinySeals;
}

export default useDestinySeals;
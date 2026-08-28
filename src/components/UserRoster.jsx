// noinspection HtmlRequiredAltAttribute,JSUnresolvedReference

import {useLocation, useNavigate} from "react-router-dom";
import Spinner from "../static/spinner-icon.svg";
import RosterPucks from "./RosterPucks.jsx";

function UserRoster({profiles, setProfileData}) {

    // user can navigate backwards/forwards in browser history
    const navigate = useNavigate();
    const { pathname } = useLocation();

    // remove profile from URL path, roster view and username
    function RemoveProfile(profileKey, temporaryProfilesObject) {

        const [, urlProfileSegment] = pathname.split("/");
        const current = urlProfileSegment || "";
        const profilesInURL = current ? current.split(",") : []; // don't join empty items

        if (profilesInURL.includes(profileKey)) {
            const newPath = profilesInURL.filter(item => item !== profileKey);
            navigate(`/${newPath}`); // push new path
        }

        // remove profile from state
        delete temporaryProfilesObject[profileKey];
        setProfileData(temporaryProfilesObject);
    }

    // remove all profiles from URL and state
    function RemoveAllProfiles() {
        navigate("/");
        setProfileData([]);
    }

    let [ , urlPath ] = pathname.split("/");
    const profilesInURL = urlPath ? urlPath.split(",") : [];

    // if no profile(s) have been selected
    if (!profilesInURL.length) return

    // create roster pucks
    return <div className="roster-outer-container">
        <div className="roster-heading-container">
            <div>Your roster ({profilesInURL?.length})</div>
            <div className="roster-button-clear" onClick={() => RemoveAllProfiles()}>Clear</div>
            {Object.keys(profiles || {}).length !== profilesInURL.length ?
                <img className="roster-spinner" src={Spinner} /> : "" }
        </div>

        <div className="roster-inner-container">
            {(Object.keys(profiles || {}).length || "") &&
                <RosterPucks profiles={profiles} setProfileData={setProfileData} RemoveProfile={RemoveProfile} /> }
        </div>
        <hr className="roster-divider" />
    </div>
}

export default UserRoster

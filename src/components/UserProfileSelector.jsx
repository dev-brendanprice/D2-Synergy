// noinspection HtmlRequiredAltAttribute

import ListGroup from 'react-bootstrap/ListGroup';
import { PlatformIcons } from '../lib/manifest.js';
import PlusIcon from '../assets/plus-icon.svg';
import {useLocation, useNavigate, useSearchParams} from "react-router-dom";
import Badge from 'react-bootstrap/Badge';
import getPlayerSeals from "../lib/playerSeals.js";

function UserProfileSelector({ profiles, setProfileData, searchResults }) {

    // user can navigate backwards/forwards in browser history
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const [ searchParams ] = useSearchParams();

    // add profile to URL path, roster view, and username for localStorage
     function AddProfile(profile) {

        // profileKey is used for URL pathing
        const profileKey = `${profile.membershipType}-${profile.membershipId}`;

        // add profile to URL path
        const [, urlProfileSegment] = pathname.split("/");
        const current = urlProfileSegment || "";
        const profilesInURL = current ? current.split(",") : []; // don't join empty items

        if (!profilesInURL.includes(profileKey)) {
            const newPath = [...profilesInURL, profileKey].join(',');
            navigate(`/${newPath}${searchParams.get("seal") ? `?seal=${searchParams.get("seal")}` : ""}`) // push new path
        }

        // fetch profile seals, save to profile state
        getPlayerSeals(profile.membershipType, profile.membershipId)
            .then(sealsArray => {
                setProfileData({
                    ...profiles,
                    [profileKey]: { profile, seals: sealsArray }
                })
            })
    }

    // user hasn't searched anything yet
    if (searchResults === null) return

    // no search results found
    else if (searchResults.length === 0) {
        return "No players found."
    }

    return <>
        <div className="list-group-heading">Select a profile</div>
        <ListGroup>
            {searchResults.map((profile) => {
                return (
                    <ListGroup.Item key={profile.membershipId}>
                        <div className="list-user-descriptors">
                            <img className="list-user-platform" src={PlatformIcons[profile.membershipType]} />
                            <div className="list-user-text">
                                <div className="list-item-name">{profile.bungieGlobalDisplayName}</div>
                                { profile.isCrossSavePrimary &&
                                    <Badge className="primary-profile-badge" pill
                                           variant="Info">Primary Profile</Badge> }
                            </div>
                        </div>
                        <div className="list-item-action" onClick={() => AddProfile(profile)}>
                            <img src={PlusIcon} />
                        </div>
                    </ListGroup.Item>
                )
            })}
        </ListGroup>
    </>
}

export default UserProfileSelector;

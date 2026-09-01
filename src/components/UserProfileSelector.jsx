// noinspection HtmlRequiredAltAttribute

import ListGroup from 'react-bootstrap/ListGroup';
import { PlatformIcons } from '../lib/manifest.js';
import PlusIcon from '../static/plus-icon.svg';
import {useLocation, useNavigate, useSearchParams} from "react-router-dom";
import getPlayerSeals from "../lib/playerSeals.js";
import getTimeAgo from "../lib/getTimeAgo.js";


function UserProfileSelector({ profiles, setProfileData, searchResults, setShowProfileSelector }) {

    // user can navigate backwards/forwards in browser history
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const [ searchParams ] = useSearchParams();

    // add profile to URL path, roster view and username
     function AddProfile(profile) {

        // profileKey is used for URL pathing
        const profileKey = `${profile.mtype}-${profile.mid}`;

        // add profile to URL path
        const [, urlProfileSegment] = pathname.split("/");
        const current = urlProfileSegment || "";
        const profilesInURL = current ? current.split(",") : []; // don't join empty items

        if (!profilesInURL.includes(profileKey)) {
            const newPath = [...profilesInURL, profileKey].join(',');
            navigate(`/${newPath}${searchParams.get("seal") ? `?seal=${searchParams.get("seal")}` : ""}`) // push new path
        }

        // fetch profile seals, save to profile state
        getPlayerSeals(profile.mtype, profile.mid)
            .then(sealsArray => {
                setProfileData({
                    ...profiles,
                    [profileKey]: { profile, seals: sealsArray }
                })
            })
        setShowProfileSelector(false);
    }

    if (!searchResults?.players?.length) {
        return <div className="search-message">No profiles could be found with "{searchResults.query}"</div>
    }

    return <div>
        <div className="list-group-heading">Select a profile</div>
        <ListGroup>
            {searchResults.players.map(profile => {
                return (
                    <ListGroup.Item key={profile.mid}>
                        <div className="list-user-container">
                            <img className="list-user-emblem-preview" src={profile.emblemIcon} />
                            <div className="list-user-attributes">
                                <div>
                                    {profile.name}
                                    <span className="list-user-displaynamecode">#{profile.code}</span>
                                </div>
                                <div className="list-user-info">
                                    <img className="list-user-platform" src={PlatformIcons[profile.mtype]} />
                                    <span className="list-user-lastseen">{getTimeAgo(profile.lastPlayed)}</span>
                                </div>
                            </div>
                        </div>
                        <div className="list-item-action" onClick={() => AddProfile(profile)}>
                            <img src={PlusIcon} />
                        </div>
                    </ListGroup.Item>
                )
            })}
        </ListGroup>
    </div>

}

export default UserProfileSelector;

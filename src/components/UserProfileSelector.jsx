// noinspection HtmlRequiredAltAttribute

import ListGroup from 'react-bootstrap/ListGroup';
import Placeholder from 'react-bootstrap/Placeholder';
import { PlatformIcons } from '../lib/manifest.js';
import PlusIcon from '../static/plus-icon.svg';
import {useLocation, useNavigate, useSearchParams} from "react-router-dom";
import getPlayerSeals from "../lib/playerSeals.js";
import getTimeAgo from "../lib/getTimeAgo.js";
import {FetchMemberships} from "../lib/playerSearch.js";
import {useEffect, useState} from "react";


function UserProfileSelector({ profiles, setProfileData, searchResults }) {

    const [ profilesLastSeen, setProfilesLastSeen ] = useState({});
    // user can navigate backwards/forwards in browser history
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const [ searchParams ] = useSearchParams();

    useEffect(() => {
        searchResults?.forEach(p => {
            FetchMemberships(p.membershipType, p.membershipId)
                .then(res => {
                    const lastSeenForThisProfile = {
                        [p.membershipId]: getTimeAgo(res.find(v => v.membershipType === p.membershipType).dateLastPlayed)
                    };
                    setProfilesLastSeen({...lastSeenForThisProfile});
                })
        })
    }, [searchResults])

    // add profile to URL path, roster view and username
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
                        <div className="list-user-container">
                            <img className="list-user-emblem-preview" src={"https://bungie.net/" + profile.iconPath} />
                            <div className="list-user-attributes">
                                <div>
                                    {profile.bungieGlobalDisplayName}
                                    <span className="list-user-displaynamecode">#{profile.bungieGlobalDisplayNameCode}</span>
                                </div>
                                <div className="list-user-info">
                                    <img className="list-user-platform" src={PlatformIcons[profile.membershipType]} />
                                    <span className="list-user-lastseen">
                                        {Object.keys(profilesLastSeen).includes(profile.membershipId) ?
                                            <div>{profilesLastSeen[profile.membershipId]}</div> :
                                            <Placeholder animation="glow"><Placeholder xs={6} /></Placeholder>}
                                    </span>
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
    </>
}

export default UserProfileSelector;

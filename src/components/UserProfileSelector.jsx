// noinspection HtmlRequiredAltAttribute

import ListGroup from 'react-bootstrap/ListGroup';
import { PlatformIcons } from '../lib/manifest.js';
import PlusIcon from '../assets/plus-icon.svg';
import {useLocation, useNavigate, useSearchParams} from "react-router-dom";
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

    function GetTimeAgo(dateString) {
        const now = new Date();
        const date = new Date(dateString);
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
        const intervals = [
            [60, 's'],
            [60, 'm'],
            [24, 'hr'],
            [7, 'd'],
            [4.34524, 'w'],
            [12, 'mo'],
            [Number.POSITIVE_INFINITY, 'yr'],
        ];

        let i = 0;
        let count = seconds;
        while (i < intervals.length - 1 && count >= intervals[i][0]) {
            count /= intervals[i][0];
            i++;
        }
        count = Math.floor(count);
        const label = intervals[i][1];
        return count === 1 ? `1${label} ago` : `${count}${label} ago`;
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
                                    <span className="list-user-lastseen">{GetTimeAgo(profile.lastSeen)}</span>
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

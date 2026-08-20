import {PlatformIcons} from "../lib/manifest.js";
import CrossIcon from "../assets/cross-icon.svg";

function RosterPucks({profiles, RemoveProfile}) {
    return (
        Object.entries(profiles).map((entry) => {
            const profileKey = entry[0];
            const { profile } = entry[1];

            return (
                <div className="roster-puck" key={profileKey} onClick={() => RemoveProfile(profileKey, profiles)}>
                    <div className="roster-puck-attrs">
                        <img className="roster-puck-platform" src={PlatformIcons[profile.membershipType]}/>
                        <div className="roster-puck-uname">{profile.bungieGlobalDisplayName}</div>
                    </div>
                    <img className="roster-puck-rm" src={CrossIcon}/>
                </div>
            );
        })
    )
}

export default RosterPucks;
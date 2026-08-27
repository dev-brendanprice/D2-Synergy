import UserSearch from "./components/UserSearch.jsx";
import UserRoster from "./components/UserRoster.jsx";
import './App.css'
import './index.css'
import HandleUrlPathing from "./lib/handleUrlPathing.js";
import {useEffect, useState} from "react";
import TitleOverview from "./components/TitleOverview.jsx";
import UserProfileSelector from './components/UserProfileSelector.jsx'

function App() {

    const [ searchResults, setSearchResults ] = useState(null);
    const [ profiles, setProfileData ] = useState({});

    // handle the URL path state
    useEffect(() => {
        HandleUrlPathing().then(setProfileData);

        window.addEventListener("popstate", () => {
            HandleUrlPathing().then(setProfileData);
        });
    }, [searchResults]);

    return <div className="toplevel">
        <div className="main">
            <UserSearch setSearchResults={setSearchResults} />
            <UserProfileSelector profiles={profiles} setProfileData={setProfileData}
                                 searchResults={ searchResults } />
            <UserRoster profiles={profiles} setProfileData={setProfileData} />
            <TitleOverview profiles={profiles} />
        </div>

        <footer>
            <div>Made with ❤️ by brendanprice</div>
            <div className="footer-links-container">
                <a className="footer-link" href="https://github.com/dev-brendanprice/D2-Synergy"
                   target="_blank">GitHub</a>
                <a className="footer-link" href="https://ko-fi.com/brendanprice" target="_blank">Donate</a>
            </div>
        </footer>
    </div>
}

export default App

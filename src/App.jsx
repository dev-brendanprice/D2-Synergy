import UserSearch from "./components/UserSearch.jsx";
import UserRoster from "./components/UserRoster.jsx";
import './App.css'
import './index.css'
import HandleUrlPathing from "./lib/handleUrlPathing.js";
import {useEffect, useState} from "react";
import TitleOverview from "./components/TitleOverview.jsx";
import UserProfileSelector from './components/UserProfileSelector.jsx'
import FirstLoadModal from "./components/FirstLoadModal.jsx";
import Footer from "./components/Footer.jsx";

function App() {

    const [ searchResults, setSearchResults ] = useState(null);
    const [ profiles, setProfileData ] = useState({});
    const [ showProfileSelector, setShowProfileSelector ] = useState(false);
    const [ showModal, setShowModal ] = useState(false);

    // handle the URL path state and modal
    useEffect(() => {
        HandleUrlPathing().then(setProfileData);

        window.addEventListener("popstate", () => {
            HandleUrlPathing().then(setProfileData);
        });
    }, [searchResults]);

    // only show modal on first load
    if (localStorage.getItem("hasModalAppeared") === null) {
        setShowModal(true);
        localStorage.setItem("hasModalAppeared", (new Date()).toString());
    }

    return <div className="toplevel">
        <FirstLoadModal show={showModal} onHide={() => setShowModal(false)} />

        <div className="main">
            <UserSearch setSearchResults={setSearchResults} setShowProfileSelector={setShowProfileSelector} />
            {showProfileSelector &&
                <UserProfileSelector profiles={profiles} setProfileData={setProfileData} searchResults={searchResults}
                                     showProfileSelector={showProfileSelector}
                                     setShowProfileSelector={setShowProfileSelector} />}
            <UserRoster profiles={profiles} setProfileData={setProfileData} />
            <TitleOverview profiles={profiles} />
        </div>

        <Footer />
    </div>
}

export default App

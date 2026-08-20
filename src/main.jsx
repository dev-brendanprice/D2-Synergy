import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from './App.jsx';
import { ValidateManifest } from "./lib/manifest.js";
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import './scss/custom.scss';

const root = document.getElementById('root');

// validate manifest on-load
await ValidateManifest();

ReactDOM.createRoot(root).render(
    <StrictMode>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<App />} />
                <Route path="/:profiles" element={<App />} />
            </Routes>
        </BrowserRouter>
    </StrictMode>
)
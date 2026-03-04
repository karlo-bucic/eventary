import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { BrowserRouter } from "react-router-dom";

import './index.css'

import App from './App.jsx'

createRoot(document.getElementById('root')).render(
    <StrictMode>

        <BrowserRouter>

            <App /> {/* ovo je glavna komponenta */}

        </BrowserRouter>

    </StrictMode>,
)


window.addEventListener('wheel', (e) => {
    if (e.ctrlKey) {
        e.preventDefault();
    }
}, { passive: false });

window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && (e.key === '+' || e.key === '-' || e.key === '=' || e.key === '0')) {
        e.preventDefault();
    }
});

// ovo tu za scrollanje je moglo i u App.jsx pod useEffect



// unutar ove datoteke vrši se povezivanje na oznaku root unutar index.html-a
// kako bi se unutar index.html-a prikazala aplikacija

// React u HTML element s id-em root iz index.html ubacuje komponentu App
// App smo morali prvo importat iz App.jsx
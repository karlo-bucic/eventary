import { Routes, Route } from "react-router-dom";
import React, { useEffect } from 'react';
import './App.css'

import StartPage from './stranice/start.jsx';
import SigninPage from './stranice/signin.jsx';
import LoginPage from './stranice/login.jsx';
import MainPage from './stranice/mainpage.jsx';
import AddeventPage from './stranice/addevent.jsx';
import LookeventPage from './stranice/lookevent.jsx';
import ProfilePage from './stranice/profile.jsx';

function App() {

    useEffect(() => {
        const userId = localStorage.getItem("userId");

        if (userId) {
            fetch(`http://localhost:5064/api/user/${userId}`)
                .then(res => res.json())
                .then(data => {
                    const tema = data.pickedTheme || data.PickedTheme || 'default';
                    document.documentElement.setAttribute('tema-boja', tema);
                    localStorage.setItem('tema', tema);
                })
                .catch(err => console.error("Greska pri dohvacanju teme:", err));
        } else {
            document.documentElement.setAttribute('tema-boja', 'default');
        }
    }, []);


    return (
        <>
            <Routes>
                <Route path="/" element={<StartPage />} />
                <Route path="/signin" element={<SigninPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/mainpage" element={<MainPage />} />
                <Route path="/addevent" element={<AddeventPage />} />
                <Route path="/lookevent" element={<LookeventPage />} />
                <Route path="/profile" element={<ProfilePage />} />
            </Routes>
        </>
    );
}

export default App;


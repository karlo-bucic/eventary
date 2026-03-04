import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';

import "./profile.css";


function ProfilePage() {

    const navigate = useNavigate();

    const savedUsername = localStorage.getItem("username") || "Username";

  
    const [newUsername, setNewUsername] = useState("");
    const [initials, setInitials] = useState("");

    const [odabranaTema, setOdabranaTema] = useState(localStorage.getItem('tema') || 'default');

    const [joinDate, setJoinDate] = useState("");

    // -----------------------------------------------------------------------------------------------------------
    
    useEffect(() => {

        const userId = localStorage.getItem("userId");

        const storedName = localStorage.getItem("username");
        if (storedName) {
            setInitials(storedName.substring(0, 2).toUpperCase());
        }

        const fetchJoinDate = async () => {
            try {
        
                const response = await fetch(`http://localhost:5064/api/user/${userId}`);
                if (response.ok) {
                    const data = await response.json();
                    const formattedDate = new Date(data.createdAt).toLocaleDateString('de-DE') + '.';
                    setJoinDate(formattedDate);
                }
            } catch (error) {
                console.error("Greska pri dohvacanju datuma:", error);
            }
        };

        if (userId) {
            fetchJoinDate();
        }
    }, []);

    // -----------------------------------------------------------------------------------------------------------

    const handleThemeSelection = (e) => {
        setOdabranaTema(e.target.value);
    };

    // -----------------------------------------------------------------------------------------------------------

    const handleUpdate = async (e) => {
        e.preventDefault();
        const userId = localStorage.getItem("userId");

     
        const stariUsername = localStorage.getItem("username");


        const usernameZaSlanje = (newUsername && newUsername.trim() !== "")
            ? newUsername
            : stariUsername;

        try {
            const response = await fetch(`http://localhost:5064/api/user/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: usernameZaSlanje, 
                    pickedTheme: odabranaTema
                })
            });

            if (response.ok) {
        
                document.documentElement.setAttribute('tema-boja', odabranaTema);
                localStorage.setItem('tema', odabranaTema);
                localStorage.setItem("username", usernameZaSlanje);

                await Swal.fire({
                    title: 'Profile updated successfully !',
                    position: 'top',
                    showConfirmButton: false, 
                    timer: 1500,
                    background: '#E3E3E3',
                    color: '#4A4A4A'     
                });

                window.location.reload();
            } else {
                alert("Error updating profile.");
            }
        } catch (error) {
            console.error("Greška:", error);
        }
    };

    // -----------------------------------------------------------------------------------------------------------

    return (

        <div className="containerProfile">

            <div className="lijevastranaProfile">
                <p className="profileP">{initials}</p>
            </div>

            <div className="desnastranaProfile">

                <form className="profileeForm profileForm" onSubmit={handleUpdate}>

                    <label className="labelprofile" htmlFor="usernamechange">USERNAME :</label>

                    <input className="inputprofile" id="usernamechange" type="text" value={newUsername} placeholder={savedUsername} onChange={(e) => setNewUsername(e.target.value)} />

                    <label className="labelprofile" htmlFor="themechange">EVENTARY THEME :</label>

                    <select className="inputprofile selectProfile" name="theme" id="themechange" onChange={handleThemeSelection} value={odabranaTema} >
                        <option value="default">PASTELAVA</option>
                        <option value="morning grass">MORNING GRASS</option>
                        <option value="dusty sea">DUSTY SEA</option>
                        <option value="lumberjack">LUMBERJACK</option>
                    </select>

                    <button className="inputprofileBtn inputprofile" type="submit">CONFIRM CHANGES</button>

                </form>

                <p className="joinedProfile">YOU JOINED EVENTARY : {joinDate || "loading..."}</p>

            </div>

        </div>

    )

}

export default ProfilePage;
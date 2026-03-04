import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';

import "./mainpage.css";

function MainPage() {

    const [events, setEvents] = useState([]);

    const [initials, setInitials] = useState("??");

    const [selectedYear, setSelectedYear] = useState(localStorage.getItem("selectedYear") || "2026");

    const navigate = useNavigate();

    // -----------------------------------------------------------------------------------------------------------

    const displayedEventsCount = events.filter(event =>
        new Date(event.eventDate || event.EventDate).getFullYear().toString() === selectedYear
    ).length;

    const currentContainerClass = displayedEventsCount <= 3
        ? "mainContainer centered"
        : "mainContainer";

    // -----------------------------------------------------------------------------------------------------------

    useEffect(() => {
        const fetchEvents = async () => {
            const token = localStorage.getItem("token"); 

            try {
                const response = await fetch("http://localhost:5064/api/eventbox", {
                    method: "GET",
                    headers: {
                        
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setEvents(data); 
                } else if (response.status === 401) {
                    console.error("Token nije valjan ili nedostaje.");
                }
            } catch (err) {
                console.error("Greška pri dohvaćanju evenata:", err);
            }
        };

        fetchEvents();
    }, []);

    // -----------------------------------------------------------------------------------------------------------

    useEffect(() => {
        const storedUsername = localStorage.getItem("username");
        if (storedUsername) {
            
            const userInitials = storedUsername.substring(0, 2).toUpperCase();
            setInitials(userInitials);
        }
    }, []);

    // -----------------------------------------------------------------------------------------------------------

    const goToAddevent = () => {
        navigate("/addevent");
    };

    const goToLookEvent = () => {
        navigate("/lookevent");
    };

    const goToProfile = () => {
        navigate("/profile");
    };

    // -----------------------------------------------------------------------------------------------------------

    const handleLogout = () => {
        Swal.fire({
            title: 'Are you sure you want to log out ?',
            showCancelButton: true,
            confirmButtonColor: '#4A4A4A',
            cancelButtonColor: '#7d7d7d',
            confirmButtonText: 'YES',
            cancelButtonText: 'CANCEL',
            background: '#E3E3E3',
            color: '#4A4A4A',
            width: '600px',
            position: 'top'
        }).then((result) => {

            if (result.isConfirmed) {
                localStorage.clear();

                document.documentElement.setAttribute('tema-boja', 'default');
                window.location.href = "/";
            }
        });
    };

    // -----------------------------------------------------------------------------------------------------------

    return (
        <div className="containerMain">
            <div className="mainTitleContainer">
                <select className="godinaOdabir" name="godine" id="godina-select" value={selectedYear} onChange={(e) => { const year = e.target.value; setSelectedYear(year); localStorage.setItem("selectedYear", year); }}>
                    <option value="2026">2026</option>
                    <option value="2025">2025</option>
                    <option value="2024">2024</option>
                    <option value="2023">2023</option>
                    <option value="2022">2022</option>
                </select>

                <p className="mainTitle">YOUR EVENTARY</p>

                <div className="buttonsMain">
                    <button className="profileBtn" onClick={goToProfile}>{initials}</button>
                    <button className="logoutBtn" onClick={handleLogout}>LOG OUT</button>
                </div>
            </div>

            <div className={currentContainerClass}>
                {events.filter(event => new Date(event.eventDate || event.EventDate).getFullYear().toString() === selectedYear).length > 0 ? (
                    events
                        .filter(event => new Date(event.eventDate || event.EventDate).getFullYear().toString() === selectedYear)
                        
                        .sort((b, a) => new Date(a.eventDate || a.EventDate) - new Date(b.eventDate || b.EventDate))
                        .map((event, index) => (
                            <div
                                className="eventBox"
                                key={event.id || event.Id}
                                
                                onClick={() => navigate("/lookevent", { state: { event: event } })}

                                style={{ animationDelay: `${index * 0.7}s` }}
                            >
                            <div className="collageContainer">
                                
                                <img className="imgV" src={`data:image/jpeg;base64,${event.images?.imageVerticalBase64 || event.Images?.ImageVerticalBase64}`} alt="" />

                                <div className="sqColumn">
                                    
                                    <img className="imgSq" src={`data:image/jpeg;base64,${event.images?.imageSquareTopBase64 || event.Images?.ImageSquareTopBase64}`} alt="" />
                                    <img className="imgSq" src={`data:image/jpeg;base64,${event.images?.imageSquareBottomBase64 || event.Images?.ImageSquareBottomBase64}`} alt="" />
                                </div>
                            </div>

                            <div className="eventText">
                               
                                <div className="titleDateRow">
                                    <p className="eventTitle">{event.title || event.Title}</p>
                                    <p className="eventDateText">
                                        {new Date(event.eventDate || event.EventDate).toLocaleDateString('hr-HR')}
                                    </p>
                                </div>

                                <div className="starRating">
                                    {[...Array(5)].map((_, i) => (
                                        <span key={i} className={i < (event.experienceScore || event.ExperienceScore) / 2 ? "gold" : ""}>★</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="noEventsMsg">No events found for this year. Add your first event</p>
                )}
            </div>

            <div className="mainFooterContainer">
                <button className="addBtn" onClick={goToAddevent}>ADD EVENT</button>
            </div>
        </div>
    );
}

export default MainPage;
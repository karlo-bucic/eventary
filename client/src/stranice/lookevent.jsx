import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

import "./lookevent.css";


function LookeventPage() {

    const location = useLocation();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);

    // -----------------------------------------------------------------------------------------------------------

    const handleDelete = async () => { // aktivira se pritiskom na "DELETE" gumb

        const result = await Swal.fire({
            title: 'Are you sure ?',
            text: "This event will be permanently deleted !",
            icon: 'question',
            position: 'center',
            showCancelButton: true,
            confirmButtonColor: '#4A4A4A',
            cancelButtonColor:'#7d7d7d',
            confirmButtonText: 'YES, DELETE',
            cancelButtonText: 'QUIT',
            background: '#E3E3E3', 
            color: '#4A4A4A' 
        });

        if (result.isConfirmed) {
            const token = localStorage.getItem("token");
            const eventId = event?.id || event?.Id;

            try {
                const response = await fetch(`http://localhost:5064/api/eventbox/${eventId}`, {
                    method: "DELETE",
                    headers: { "Authorization": `Bearer ${token}` }
                });

                if (response.ok) {
                    await Swal.fire({
                        title: 'Event is successfully deleted.',
                        position: 'top',
                        background: '#E3E3E3',
                        color: '#4A4A4A', 
                        confirmButtonText: 'OK',
                        confirmButtonColor: '#4A4A4A',

                    });
                    navigate("/mainpage");
                }
            } catch (error) {
                Swal.fire({ icon: 'error', title: 'Greška', text: 'Server nije odgovorio.' });
            }
        }
    };

    // -----------------------------------------------------------------------------------------------------------

    useEffect(() => {
        const fetchEvent = async () => {
            const eventId = location.state?.event?.id || location.state?.event?.Id;

            if (!eventId) {
                setLoading(false);
                return;
            }

            try {
                const token = localStorage.getItem("token");
                const response = await fetch(`http://localhost:5064/api/eventbox/${eventId}`, {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setEvent(data);
                }
            } catch (error) {
                console.error("Greška pri dohvaćanju eventa:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchEvent();
    }, [location.state]);

    // -----------------------------------------------------------------------------------------------------------

    if (loading) return <div className="look-event-container">Učitavanje...</div>;
    if (!event) return <div className="look-event-container">Event nije pronađen.</div>;

    const eventImages = event.images || event.Images;

    // -----------------------------------------------------------------------------------------------------------

    return (
        <div className="look-event-container">
            <div className="image-grid-header">
                <div className="big-img-box">
                    
                    {eventImages?.imageVerticalBase64 && (
                        <img
                            src={`data:image/jpeg;base64,${eventImages.imageVerticalBase64}`}
                            alt="Main"
                        />
                    )}
                </div>
                <div className="small-img-column">
                    <div className="small-img-box">
                       
                        {eventImages?.imageSquareTopBase64 && (
                            <img
                                src={`data:image/jpeg;base64,${eventImages.imageSquareTopBase64}`}
                                alt="Sub 1"
                            />
                        )}
                    </div>
                    <div className="small-img-box">
                      
                        {eventImages?.imageSquareBottomBase64 && (
                            <img
                                src={`data:image/jpeg;base64,${eventImages.imageSquareBottomBase64}`}
                                alt="Sub 2"
                            />
                        )}
                    </div>
                </div>
            </div>

            <div className="event-info-section">
                <div className="info-block">
                    <label>TITLE</label>
                    <h2 className="event-data-text">{event.title || event.Title}</h2>
                </div>

                <div className="info-block">
                    <label>LOCATION - CITY</label>
                    <h2 className="event-data-text">{event.locationCity || event.LocationCity}</h2>
                </div>

                <div className="info-block">
                    <label>LOCATION - STREET</label>
                    <h2 className="event-data-text">{event.locationStreet || event.LocationStreet}</h2>
                </div>

                <div className="info-block">
                    <label>DATE</label>
                    <h2 className="event-data-text">
                        {event.eventDate || event.EventDate
                            ? new Date(event.eventDate || event.EventDate).toLocaleDateString("hr-HR") + "."
                            : "NEMA DATUMA"}
                    </h2>
                </div>

                <div className="info-block">
                    <label>EXPERIENCE SCORE</label>
                    <div className="star-rating-display">
                        {[...Array(5)].map((_, i) => (
                            <span key={i} className={i < (event.experienceScore || event.ExperienceScore) / 2 ? "gold" : ""}>★</span>
                        ))}
                    </div>
                </div>
            </div>

            <div className="lookEventBtns">
                <button className="delete-event-btn" onClick={handleDelete}>
                    DELETE
                </button>
                <button className="go-back-btn" onClick={() => navigate(-1)}>
                    GO BACK
                </button>
            </div>

        </div>
    );
}

export default LookeventPage;
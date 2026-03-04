import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';

import "./addevent.css";


function AddEventPage() {

    const navigate = useNavigate();

    const [previews, setPreviews] = useState({ img1: null, img2: null, img3: null });

    const [files, setFiles] = useState({ img1: null, img2: null, img3: null });

    const [title, setTitle] = useState("");
    const [city, setCity] = useState("");
    const [street, setStreet] = useState("");
    const [date, setDate] = useState("");
    const [score, setScore] = useState("");

    const fileInput1 = useRef(null);
    const fileInput2 = useRef(null);
    const fileInput3 = useRef(null);

    // -----------------------------------------------------------------------------------------------------------

    const handleImageChange = (e, key) => { // omogucuje pregled odabranih slika prije slanja
        const file = e.target.files[0];
        if (file) {
            setPreviews({ ...previews, [key]: URL.createObjectURL(file) });
            setFiles({ ...files, [key]: file });
        }
    };

    // -----------------------------------------------------------------------------------------------------------

    const handlePotvrdi = async (e) => { // aktivira se pritiskom na "ADD EVENT" gumb
        e.preventDefault();

        if (!title.trim() || !city.trim() || !date || !score || !files.img1 || !files.img2 || !files.img3) {
            Swal.fire({
                title: 'Missing information !',
                text: 'Please fill all required fields.',
                position: 'top',
                confirmButtonColor: '#696666',
                background: '#E3E3E3',
                color: '#4A4A4A',
            });
            return; 
        }


        const token = localStorage.getItem("token");
        if (!token) {
            alert("Niste prijavljeni. Molimo prijavite se ponovno.");
            return;
        }

        const formData = new FormData();
        formData.append("Title", title);
        formData.append("LocationCity", city);
        formData.append("LocationStreet", street || "NOT SPECIFIED");

        formData.append("LocationStreetNumber", "1");

        formData.append("EventDate", date);
        formData.append("ExperienceScore", score);

        if (files.img1) formData.append("vertical", files.img1);
        if (files.img2) formData.append("top", files.img2);
        if (files.img3) formData.append("bottom", files.img3);

        try {
            const response = await fetch("http://localhost:5064/api/eventbox", {
                method: "POST",
                headers: {

                    "Authorization": `Bearer ${token}`
                },
                body: formData
            });

            if (response.ok) {

                await Swal.fire({
                    title: 'Event added to your Eventary !',
                    position: 'top',
                    showConfirmButton: false,
                    timer: 1500,
                    background: '#E3E3E3',
                    color: '#4A4A4A'
                });

                navigate("/mainpage");
            } else if (response.status === 401) {
                alert("Greska 401: Niste autorizirani. Ponovno se prijavite.");
            } else {
                const errorText = await response.text();
                console.error("Backend Error:", errorText);
                alert("Greska s backenda: " + errorText);
            }
        } catch (error) {
            console.error("Greska pri slanju:", error);
        }

    };

    // -----------------------------------------------------------------------------------------------------------

    return (
        <div className="add-event-scroll-container">
            <section className="add-event-wide-wrapper">
                <h1 className="add-event-title">ADD NEW EVENT</h1>

                <div className="image-upload-grid">
                    <div className="big-image-box" onClick={() => fileInput1.current.click()}>
                        {previews.img1 ? <img src={previews.img1} alt="preview" /> : <span>ADD IMAGE 1</span>}
                        <input type="file" ref={fileInput1} hidden onChange={(e) => handleImageChange(e, "img1")} />
                    </div>

                    <aside className="small-images-column">
                        <div className="small-image-box" onClick={() => fileInput2.current.click()}>
                            {previews.img2 ? <img src={previews.img2} alt="preview" /> : <span>ADD IMAGE 2</span>}
                            <input type="file" ref={fileInput2} hidden onChange={(e) => handleImageChange(e, "img2")} />
                        </div>
                        <div className="small-image-box" onClick={() => fileInput3.current.click()}>
                            {previews.img3 ? <img src={previews.img3} alt="preview" /> : <span>ADD IMAGE 3</span>}
                            <input type="file" ref={fileInput3} hidden onChange={(e) => handleImageChange(e, "img3")} />
                        </div>
                    </aside>
                </div>

                <form id="event-form" className="event-details-form" onSubmit={handlePotvrdi} noValidate>
                    <label>TITLE : *</label>
                    <input type="text" value={title} maxLength={10} onChange={(e) => setTitle(e.target.value)} required />

                    <label>LOCATION - CITY : *</label>
                    <input type="text" value={city} maxLength={20} onChange={(e) => setCity(e.target.value)} required />

                    <label>LOCATION - STREET :</label>
                    <input type="text" value={street} maxLength={40} onChange={(e) => setStreet(e.target.value)} />

                    <label>DATE : *</label>
                    <input className="dateInput" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />

                    <label>EXPERIENCE SCORE ( 1 - 10 ) : *</label>
                    <input type="number" min="1" max="10" value={score} onChange={(e) => setScore(e.target.value)} required />
                </form>
            </section>

            <footer className="full-width-buttons">
                <button type="submit" form="event-form" className="btn-potvrdi-full">ADD EVENT</button>
                <button type="button" className="btn-odustani-full" onClick={() => navigate("/mainpage")}>GO BACK</button>
            </footer>
        </div>
    );
}

export default AddEventPage;
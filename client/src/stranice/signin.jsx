import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';

import "./signin.css";


function SigninPage() {

    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState(""); 

    const [loading, setLoading] = useState(false);

    // -----------------------------------------------------------------------------------------------------------

    const handleSubmit = async (e) => {

        e.preventDefault();

        if (!username || !email || !password || !confirmPassword) {
            await Swal.fire({
                title: 'Missing information !',
                text: 'Please fill all required fields.',
                position: 'top',
                confirmButtonColor: '#696666',
                background: '#E3E3E3',
                color: '#4A4A4A',
            });
            return;
        }

      
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            await Swal.fire({
                title: 'Invalid E-mail !',
                text: 'please enter a valid e-mail address ( e.g. name@example.com )',
                position: 'top',
                confirmButtonColor: '#696666',
                background: '#E3E3E3',
                color: '#4A4A4A',
            });
            return;
        }

        if (password !== confirmPassword) {
            await Swal.fire({
                title: 'Passwords do not match !',
                text: 'Please make sure both passwords are identical.',
                position: 'top',
                confirmButtonColor: '#696666',
                background: '#E3E3E3',
                color: '#4A4A4A',
            });
            setLoading(false);
            return;
        }

        setLoading(true);

        const userData = {
            Username: username,
            Email: email,
            Password: password
        };

        try {
            const response = await fetch("http://localhost:5064/api/user", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userData),
            });

            if (response.ok) {
                const data = await response.json();

                localStorage.setItem("userId", data.id);
                localStorage.setItem("username", data.username);
                localStorage.setItem("token", data.token); 

                await Swal.fire({
                    title: 'Sign in successful!',
                    position: 'top',
                    timer: 1500,
                    showConfirmButton: false,
                    background: '#E3E3E3',
                    color: '#719e6c'
                });

                window.location.href = "/mainpage";

            } else {
                const errorText = await response.text();
                await Swal.fire({
                    title: 'Registration Failed',
                    text: errorText,
                    position: 'top',
                    confirmButtonColor: '#696666',
                    background: '#E3E3E3',
                    color: '#4A4A4A'
                });
            }
        } catch (error) {

            console.error("Detalji greške:", error);
            await Swal.fire({
                title: 'Connection Error',
                text: 'Check console (F12) for details.',
                position: 'top',
                confirmButtonColor: '#696666',
                background: '#E3E3E3',
                color: '#4A4A4A'
            });
        } finally {
            setLoading(false);
        }
    };

    // -----------------------------------------------------------------------------------------------------------

    return (

        <div className="containerSignin">

            <div className="lijevastrana">
                <p className="signinTitle">SIGN IN</p>
            </div>

            <div className="desnastrana">

                <form className="signlogForm" onSubmit={handleSubmit} noValidate>

                    <label className="labelsignin" htmlFor="ime">CHOOSE YOUR USERNAME :</label>

                    <input className="inputsignin" maxLength={20} id="ime" type="text" name="ime" value={username} onChange={(e) => setUsername(e.target.value)} required />

                    <label className="labelsignin" htmlFor="mail">ENTER YOUR E-MAIL :</label>

                    <input className="inputsignin" maxLength={30} id="mail" type="email" name="mail" value={email} onChange={(e) => setEmail(e.target.value)} required />

                    <label className="labelsignin" htmlFor="lozinka">CHOOSE YOUR PASSWORD :</label>

                    <input className="inputsignin" maxLength={20} id="lozinka" type="password" name="lozinka" value={password} onChange={(e) => setPassword(e.target.value)} required />

                    <label className="labelsignin" htmlFor="potvrda">CONFIRM YOUR PASSWORD :</label>

                    <input className="inputsignin" maxLength={20} id="potvrda" type="password" name="potvrda" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />

                    <button className="inputsigninBtn" type="submit">CONFIRM</button>

                </form>

            </div>

        </div>

    )
}

export default SigninPage;
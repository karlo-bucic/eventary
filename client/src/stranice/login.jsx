import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';

import "./login.css";


function LoginPage() {

    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // -----------------------------------------------------------------------------------------------------------

    const handleSubmit = async (e) => { // aktivira se pritiskom na "CONFIRM" gumb
        e.preventDefault();

        const loginData = { Email: email, Password: password };

        try {
            const response = await fetch("http://localhost:5064/api/user/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(loginData)
            });

            if (response.ok) {
                const data = await response.json();

                localStorage.setItem("token", data.Token || data.token);
                localStorage.setItem("username", data.Username || data.username);
                localStorage.setItem("userId", data.Id || data.id);

                const odabranaTema = data.PickedTheme || data.pickedTheme || 'default';
                localStorage.setItem("tema", odabranaTema);
                document.documentElement.setAttribute('tema-boja', odabranaTema);

                await Swal.fire({
                    title: 'Log in successful !',
                    position: 'top',
                    showConfirmButton: false, 
                    timer: 1500,
                    background: '#E3E3E3',
                    color: '#719e6c'     
                });

                window.location.href = "/mainpage";
            } else {

                Swal.fire({
                    title: 'Wrong email or password !',
                    text: 'Enter correct credentials to log in.',
                    position: 'top',
                    confirmButtonColor: '#696666', 
                    background: '#E3E3E3',
                    color: '#4A4A4A'
                });
            }
        } catch (error) {

            Swal.fire({
                title: 'Server Error',
                text: 'Unable to contact backend. Please check port 5064.',
                position: 'top',
                confirmButtonColor: '#696666',
                background: '#E3E3E3',
                color: '#4A4A4A'
            });
        }

    };

    // -----------------------------------------------------------------------------------------------------------

    return (

        <div className="containerSignin">

            <div className="lijevastrana">
                <p className="loginTitle">LOG IN</p>
            </div>

            <div className="desnastrana">

                <form className="loginnForm loginForm" onSubmit={handleSubmit}>

                    <label className="labellogin" htmlFor="mail">ENTER YOUR E-MAIL :</label>

                    <input className="inputlogin" maxLength={30} id="mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />

                    <label className="labellogin" htmlFor="lozinka">ENTER YOUR PASSWORD :</label>

                    <input className="inputlogin" maxLength={20} id="lozinka" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

                    <button className="inputloginBtn inputlogin" type="submit">CONFIRM</button>

                </form>

            </div>

        </div>

    )

}

export default LoginPage;
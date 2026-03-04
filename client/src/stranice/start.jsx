import { useNavigate } from "react-router-dom";
import mojaSlika from '../assets/konacna.JPG';

import "./start.css";


function StartPage() {

    // -----------------------------------------------------------------------------------------------------------

    const navigate = useNavigate();

    const goToSignIn = () => {
        navigate("/signin");
    };

    const goToLogIn = () => {
        navigate("/login");
    };

    // -----------------------------------------------------------------------------------------------------------

    return (

        <div className="containerStart">

            <div className="containerStartLeft">
                <img src={mojaSlika} alt="Eventary homepage slika" className="startImg"/>
            </div>

            <div className="containerStartRight">

                <p className="pgornji pStart">WANT TO REMEMBER YOUR BEST MOMENTS ?</p>

                <button className="startBtn gumbgornji" onClick={goToSignIn}>REGISTER</button>
                <button className="startBtn gumbdonji" onClick={goToLogIn}>LOG IN</button>

                <p className="pdonji pStart">REGISTER IN EVENTARY AND CREATE YOUR FIRST MEMORIES TODAY !</p>

            </div>

        </div>
    
    )

}

export default StartPage;
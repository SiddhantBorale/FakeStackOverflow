
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../stylesheets/App.css';
import Cookies from 'js-cookie';

export default function LeftandTop() {
    const [searchText, setSearchText] = useState("");
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();

    const handleEnter = (e) => {
        if (e.keyCode === 13) {
            if (searchText === "") {
                navigate("/questions");
            } else {
                navigate(`/questions/search/${encodeURIComponent(searchText)}`)
            }
        }
    }

    const handleLogout = (e) => {
        e.preventDefault();
        if (isLoggedIn) {
            Cookies.remove("token");
        }
        navigate("/");
    }

    useEffect(() => {
        if (Cookies.get('token')) {
            setIsLoggedIn(true);
        } else {
            setIsLoggedIn(false);
        }
    }, [])

    return (
        <>
            <div id="header" className="header">
                {isLoggedIn && <button className='ask-question-button' onClick={(e) => handleLogout(e)}>Logout</button>}
                <h1>Fake Stack Overflow</h1>
                <input id="search-bar" className="search-bar" type="text" placeholder="Search..." 
                onChange={e => setSearchText(e.target.value)} onKeyDown={e => handleEnter(e)}/>
            </div>
            <div className="left-bar">
                <Link to="/questions"className="left-bar-questions">
                    Questions
                </Link>
                <br />
                <Link to="/tags" className="left-bar-tags" >
                    Tags
                </Link>
                <br/>
                <Link to="/profile" className="left-bar-tags" >
                    Profile
                </Link>
                <br />
                <Link to="/" className="left-bar-tags" >
                    Home
                </Link>                
            </div>
        </>
    );
}
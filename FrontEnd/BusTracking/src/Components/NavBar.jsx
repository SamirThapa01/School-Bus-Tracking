import React, { useState, useEffect, useRef } from "react";
import { 
  GiHamburgerMenu 
} from "react-icons/gi";
import { 
  Clock, 
  Bus, 
  Users, 
  Activity 
} from "lucide-react";
import Options from "./options";

function NavBar({ handleClick, login, logins }) {
  const [time, setTime] = useState("");
  const [show, setShow] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const menuRef = useRef(null);

  const showDiv = () => {
    setShow((current) => !current);
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShow(false);
      }
    }

    function handleScroll() {
      setIsScrolled(window.scrollY > 50);
    }

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const updateClock = () => {
      const date = new Date();
      setTime(`${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}`);
    };
    updateClock();
    const intervalId = setInterval(updateClock, 1000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <nav className={`navbar ${isScrolled ? 'navbar-scrolled' : ''}`}>
      <div className="navbar-container">
        <div className="navbar-brand">
          <div className="navbar-logo-wrapper">
            <Bus className="navbar-logo-icon" />
            <div className="navbar-logo-text">
              <div className="navbar-logo">BTS</div>
              <h2 className="navbar-subtitle">Bus Tracking System</h2>
            </div>
          </div>
        </div>

        <div className="navbar-content">
          <div className="navbar-stats-container">
            <div className="navbar-stats">
              <div className="stat-item">
                <Activity className="stat-icon" size={18} />
                <span>Active Buses:</span>
                <strong>1</strong>
              </div>
              <div className="stat-item">
                <Users className="stat-icon" size={18} />
                <span>Students Picked:</span>
                <strong>95%</strong>
              </div>
            </div>
            <div className="navbar-time">
              <Clock className="time-icon" size={18} />
              <span>{time}</span>
            </div>
          </div>

          <div className="navbar-actions">
            {login ? (
              <div ref={menuRef} className="menu-container">
                <button 
                  onClick={showDiv} 
                  className="hamburger-button"
                >
                  <GiHamburgerMenu size={25} />
                </button>
                {show && (
                  <Options 
                    logins={logins} 
                    login={login} 
                    setShow={setShow} 
                  />
                )}
              </div>
            ) : (
              <button 
                className="login-button" 
                onClick={handleClick}
              >
                Login
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default NavBar;
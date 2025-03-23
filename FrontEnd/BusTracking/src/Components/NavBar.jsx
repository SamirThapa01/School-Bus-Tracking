import React, { useState, useEffect, useRef } from "react";
import { GiHamburgerMenu } from "react-icons/gi";
import Options from "./options";

function NavBar({ handleClick, login, logins }) {
  const [time, setTime] = useState("");
  const [show, setShow] = useState(false);
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

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
    <>
      <nav className="navbar">
        <div className="navbar-logo-section">
          <div className="navbar-logo">BTS</div>
          <h2 className="navbar-title">Bus Tracking System</h2>
        </div>

        <div className="navbar-controls">
          <div className="navbar-stats">
            <div className="stat-item">
              <span>Active Buses:</span>
              <strong>1</strong>
            </div>
            <div className="stat-item">
              <span>Students Picked:</span>
              <strong>95%</strong>
            </div>
          </div>
          <span>{time}</span>
          {login ? (
            <div ref={menuRef} className="menu-container">
              <GiHamburgerMenu onClick={showDiv} size={25} className="hamburger" />
              {show && <Options logins={logins} login={login} setShow={setShow} />}
            </div>
          ) : (
            <button className="login-button" onClick={handleClick}>
              Login
            </button>
          )}
        </div>
      </nav>
    </>
  );
}

export default NavBar;
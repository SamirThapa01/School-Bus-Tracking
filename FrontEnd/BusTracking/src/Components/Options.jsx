import React from 'react';
import { FaUser, FaTachometerAlt, FaSignOutAlt } from 'react-icons/fa';
import { sendData } from './Axious';
import { IoMdNotifications } from "react-icons/io";
import { Navigate, useNavigate } from 'react-router-dom';

const options = [
  { name: 'Profile', icon: <FaUser /> },
  { name: 'Dashboard', icon: <FaTachometerAlt /> },
  { name: 'Logout', icon: <FaSignOutAlt /> },
  { name: 'Notification', icon: <IoMdNotifications/>} 
];

function Options({ logins, setShow }) {
    const Navigation = useNavigate();
    const handleClick = async (e) => {
        const selectedMenu = e.currentTarget.textContent.trim();
        
        if (selectedMenu === 'Logout') {
            try {
                const [response, error] = await sendData("http://localhost:8000/react/logout", {});
                
                if (error) {
                    console.log("Logout failed");
                    return;
                }
                
                if (response?.success) {
                    console.log("logout success");
                    logins(false);
                    setShow(false); 
                }
            } catch (error) {
                console.log("Error occurred:", error);
            }
        }

        if (selectedMenu === 'Profile'){
            Navigation("/profile")
        }
    };

    return (
        <div className="box_container">
            <ul>
                {options.map((item, index) => (
                    <li key={index} onClick={handleClick}>
                        {item.icon} {item.name}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Options;
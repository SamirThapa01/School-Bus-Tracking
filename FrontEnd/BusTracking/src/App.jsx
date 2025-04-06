import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";
import HomePage from "./Pages/HomePage";
import Login from "./Components/LoginForm";
import Signup from "./Components/signup";
import Otp from "./Components/Otp";
import { sendData } from "./Components/Axious";
import axios from "axios";
import ProfilePage from "./Pages/ProfilePage";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AdminPanel from "./Components/AdminPanel";
import LiveTracking from "./Pages/LiveTracking";
import UserProfile from "./Components/UserProfile";
import CreateUser from "./Components/CreateUser";
import Driver from "./Components/Driver";

const App = () => {
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showSignupForm, setShowSignForm] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState("");
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [login, setLogin] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get("http://localhost:8000/react/verify", {
          withCredentials: true,
        });
        console.log(response);
        if (response.data.success) {
          console.log(response);
          console.log(login);
          setLogin(true);
        }
      } catch (err) {
        console.log(err);
        setLogin(false);
      }
    };
    if (!login) {
      checkAuth();
    }
  }, [location.pathname]);

  const handleOtp = (data) => {
    setOtp(data);
    setShowOtp(false);
  };

  const checkLogin = (status) => {
    setLogin(status);
  };

  // Toggle login form
  const handleLoginClick = () => {
    setShowLoginForm((prev) => !prev);
  };

  const handleSignupClick = () => {
    setShowSignForm((prev) => !prev);
  };

  const handleShowOtp = () => {
    setShowOtp(true);
  };

  console.log(login);
  return (
    <>
      <ToastContainer style={{ fontSize: "14px", zIndex: 9999 }} />
      <Routes>
        <Route
          path="/map"
          element={
            <HomePage
              handleLoginClick={handleLoginClick}
              signupSuccess={signupSuccess}
              login={login}
              logins={checkLogin}
            />
          }
        />

        <Route
          path="/liveTracking"
          element={
            <LiveTracking
              handleLoginClick={handleLoginClick}
              signupSuccess={signupSuccess}
              login={login}
              logins={checkLogin}
            />
          }
        />
        <Route
          path="/profile"
          element={
            <ProfilePage
              handleLoginClick={handleLoginClick}
              signupSuccess={signupSuccess}
              login={login}
              logins={checkLogin}
            />
          }
        />

        <Route path="*" element={<h1>404 - Page Not Found</h1>} />
        <Route path="/user" element={<CreateUser />} />
        <Route path="/driver" element={<Driver />}></Route>
        <Route
          path="/admin"
          element={
            <AdminPanel
              handleLoginClick={handleLoginClick}
              signupSuccess={signupSuccess}
              login={login}
              logins={checkLogin}
            />
          }
        />
      </Routes>
      {showLoginForm && (
        <Login
          onCloseLogin={handleLoginClick}
          onCloseSignup={handleSignupClick}
          login={checkLogin}
        />
      )}

      {showSignupForm && (
        <Signup
          onCloseSignup={handleSignupClick}
          onCloseLogin={handleLoginClick}
          onOtp={handleShowOtp}
        />
      )}
      {showOtp && <Otp getOpt={handleOtp} login={checkLogin} />}
    </>
  );
};

const AppWrap = () => {
  return (
    <>
      <Router>
        <App />
      </Router>
    </>
  );
};

export default AppWrap;

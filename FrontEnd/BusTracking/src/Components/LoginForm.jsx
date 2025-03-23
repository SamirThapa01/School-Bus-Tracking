import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Signup.css";
import { IoEyeOutline } from "react-icons/io5";
import { FaRegEyeSlash } from "react-icons/fa";
import Google from "./Google";
import { sendData } from "./Axious";
import { toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Login = ({ onCloseLogin, onCloseSignup, login }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const formRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (formRef.current && !formRef.current.contains(event.target)) {
        onCloseLogin();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onCloseLogin]);

  const handlePasswordEye = () => setShowPassword(!showPassword);

  const handleSignup = () => {
    onCloseLogin();
    onCloseSignup();
  };

  const validate = () => {
    let isValid = true;

    // Email validation
    if (!email) {
      setEmailError("Email is required");
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Invalid email address");
      isValid = false;
    } else {
      setEmailError("");
    }

    //password validation
    if (!password) {
      setPasswordError("Password is required");
      isValid = false;
    } else if (!/(?=.*[A-Z])/.test(password)) {
      setPasswordError("At least one uppercase letter is required");
      isValid = false;
    } else if (!/(?=.*[a-z])/.test(password)) {
      setPasswordError("Password must contain a lowercase letter");
      isValid = false;
    } else if (!/(?=.*\d)/.test(password)) {
      setPasswordError("Password must contain one number");
      isValid = false;
    } else if (password.length < 8) {
      setPasswordError("Password should be more than 8 letters");
      isValid = false;
    } else if (!/(?=.*[!@#$%^&*(),.?":{}|<>])/.test(password)) {
      setPasswordError("Password must contain a special character");
      isValid = false;
    } else {
      setPasswordError("");
    }

    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      console.log("User email:", email);
      console.log("Password:", password);
      try {
        const [response, error] = await sendData(
          "http://localhost:8000/react/login",
          { email, password }
        );
        if (error) {
          console.log("login failed");
          return;
        }
        if (response?.success) {
          console.log(response);
          console.log("login was successful");
          login(true);
          console.log("Displaying toast...");
          toast.success("Login successful!", {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "colored",
            transition: Bounce,
          });
        }
      } catch (error) {
        console.log("Error occured", error);
      }
      onCloseLogin();
    }
  };

  return (
    <div className="overlay">
      <div className="container" ref={formRef}>
        <div className="info">
          <h1>Login</h1>
          <p>
            Don't have an account?{" "}
            <strong className="login-link" onClick={handleSignup}>
              Sign up
            </strong>
          </p>
        </div>
        <div className="signup-box">
          <div className="form-section">
            <form onSubmit={handleSubmit}>
              <div className="inputs">
                <input
                  type="email"
                  className="input-field"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)} // Remove validate() here
                  placeholder=" "
                />
                <label>Email</label>
                {emailError && <span className="error">{emailError}</span>}
              </div>

              <div className="inputs">
                <input
                  type={showPassword ? "text" : "password"}
                  className="input-field"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder=" "
                />
                <label>Password</label>
                {password &&
                  (showPassword ? (
                    <IoEyeOutline
                      className="icon"
                      onClick={handlePasswordEye}
                    />
                  ) : (
                    <FaRegEyeSlash
                      className="icon"
                      onClick={handlePasswordEye}
                    />
                  ))}
                {passwordError && (
                  <span className="error">{passwordError}</span>
                )}
              </div>

              <button className="signup-button">Login</button>
            </form>
          </div>
          <span className="or-divider">or</span>
          <div className="social-section">
            <Google />
          </div>
        </div>
        <div className="terms">
          <p>
            By continuing, you agree to our{" "}
            <Link to="/terms" className="login-link">
              Terms of Service
            </Link>{" "}
            and acknowledge our{" "}
            <Link to="/privacy" className="login-link">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

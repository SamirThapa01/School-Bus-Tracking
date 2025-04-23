import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Signup.css";
import { IoEyeOutline } from "react-icons/io5";
import { FaRegEyeSlash } from "react-icons/fa";
import Google from "./Google";
import { sendData } from "./Axious";
import configFile from "../Config/ApiConfig";

const Signup = ({ onCloseSignup, onCloseLogin, onOtp }) => {
  const [inputs, setInputs] = useState({
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const formRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (formRef.current && !formRef.current.contains(event.target)) {
        onCloseSignup();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onCloseSignup]);

  const handlePasswordEye = () => setShowPassword(!showPassword);
  const handleConfirmPasswordEye = () =>
    setShowConfirmPassword(!showConfirmPassword);

  const handleLogin = () => {
    onCloseSignup();
    onCloseLogin();
  };

  const validate = () => {
    let isValid = true;
    const newErrors = {
      email: "",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
    };

    // Email validation
    if (!inputs.email) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(inputs.email)) {
      newErrors.email = "Invalid email address";
      isValid = false;
    }

    // Phone Number validation
    if (!inputs.phoneNumber) {
      newErrors.phoneNumber = "Phone number is required";
      isValid = false;
    } else if (!/^\d{10}$/.test(inputs.phoneNumber)) {
      newErrors.phoneNumber = "Phone number must be 10 digits";
      isValid = false;
    }

    // Password validation
    if (!inputs.password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (!/(?=.*[A-Z])/.test(inputs.password)) {
      newErrors.password = "At least one uppercase letter is required";
      isValid = false;
    } else if (!/(?=.*[a-z])/.test(inputs.password)) {
      newErrors.password = "Password must contain a lowercase letter";
      isValid = false;
    } else if (!/(?=.*\d)/.test(inputs.password)) {
      newErrors.password = "Password must contain one number";
      isValid = false;
    } else if (inputs.password.length < 8) {
      newErrors.password = "Password should be more than 8 letters";
      isValid = false;
    } else if (!/(?=.*[!@#$%^&*(),.?":{}|<>])/.test(inputs.password)) {
      newErrors.password = "Password must contain a special character";
      isValid = false;
    }

    // Confirm Password validation
    if (!inputs.confirmPassword) {
      newErrors.confirmPassword = "Confirm password is required";
      isValid = false;
    } else if (inputs.confirmPassword !== inputs.password) {
      newErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }

    setIsLoading(true);
    try {
      localStorage.setItem("signupData", JSON.stringify(inputs));
      const [response, error] = await sendData(
        `${configFile.apiUrl}/react/requestOtp`,
        { email: inputs.email }
      );

      if (error) {
        setErrors((prev) => ({
          ...prev,
          email: "Signup failed. Please try again.",
        }));
        return;
      }

      if (response?.success) {
        console.log("OTP request successful");
        onOtp();
        onCloseSignup();
      } else {
        setErrors((prev) => ({
          ...prev,
          email: "User already exists",
        }));
      }
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        email: "An error occurred. Please try again.",
      }));
      console.error("Error occurred:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="overlay">
      <div className="container" ref={formRef}>
        <div className="info">
          <h1>Sign Up</h1>
          <p>
            Already have an account?{" "}
            <strong className="login-link" onClick={handleLogin}>
              Login
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
                  name="email"
                  value={inputs.email}
                  onChange={handleChange}
                  placeholder=" "
                  disabled={isLoading}
                />
                <label>Email</label>
                {errors.email && <span className="error">{errors.email}</span>}
              </div>

              <div className="inputs">
                <input
                  type="tel"
                  className="input-field"
                  name="phoneNumber"
                  value={inputs.phoneNumber}
                  onChange={handleChange}
                  placeholder=" "
                  disabled={isLoading}
                />
                <label>Phone Number</label>
                {errors.phoneNumber && (
                  <span className="error">{errors.phoneNumber}</span>
                )}
              </div>

              <div className="inputs">
                <input
                  type={showPassword ? "text" : "password"}
                  className="input-field"
                  name="password"
                  value={inputs.password}
                  onChange={handleChange}
                  placeholder=" "
                  disabled={isLoading}
                />
                <label>Password</label>
                {inputs.password &&
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
                {errors.password && (
                  <span className="error">{errors.password}</span>
                )}
              </div>

              <div className="inputs">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className="input-field"
                  name="confirmPassword"
                  value={inputs.confirmPassword}
                  onChange={handleChange}
                  placeholder=" "
                  disabled={isLoading}
                />
                <label>Confirm Password</label>
                {inputs.confirmPassword &&
                  (showConfirmPassword ? (
                    <IoEyeOutline
                      className="icon"
                      onClick={handleConfirmPasswordEye}
                    />
                  ) : (
                    <FaRegEyeSlash
                      className="icon"
                      onClick={handleConfirmPasswordEye}
                    />
                  ))}
                {errors.confirmPassword && (
                  <span className="error">{errors.confirmPassword}</span>
                )}
              </div>

              <button
                className="signup-button"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? "Signing up..." : "Sign Up"}
              </button>
            </form>
          </div>
          <span className="or-divider">or</span>
          <div className="social-section">
            <Google />
          </div>
        </div>
        <div className="terms">
          <p>
            By signing up, you agree to our{" "}
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

export default Signup;

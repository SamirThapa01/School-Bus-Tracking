import React, { useRef, useState } from "react";
import "./Signup.css";
import { sendData } from "./Axious";
import configFile from "../Config/ApiConfig";

function Otp({ getOpt, login }) {
  const inputRef = useRef([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const handleChange = (event, index) => {
    const value = event.target.value.replace(/[^0-9]/g, "");
    event.target.value = value;

    if (value.length === 1 && index < inputRef.current.length - 1) {
      inputRef.current[index + 1].focus();
    }
  };

  const handleKeyDown = (event, index) => {
    if (event.key === "Backspace" && !event.target.value && index > 0) {
      inputRef.current[index - 1].focus();
    }
  };

  const verifyOtp = async (otp) => {
    setIsLoading(true);
    setError("");

    try {
      const data = JSON.parse(localStorage.getItem("signupData"));
      if (!data) {
        const errorMsg = "Signup data not found. Please try again.";
        setError(errorMsg);

        return;
      }

      const [verifyResponse, verifyError] = await sendData(
        `${configFile.apiUrl}/react/verifyOtp`,
        { email: data.email, otp: otp }
      );

      if (verifyError) {
        const errorMsg = verifyError.message || "Failed to verify OTP";
        setError(errorMsg);

        return;
      }

      if (verifyResponse.success) {
        getOpt(false);
        login(true);
        console.log(verifyResponse.message);
        const [signupResponse, signupError] = await sendData(
          `${configFile.apiUrl}/react/userSignup`,
          data
        );

        if (signupError) {
          const errorMsg = signupError.message || "Failed to complete signup";
          setError(errorMsg);
          return;
        }

        if (signupResponse.success) {
          localStorage.removeItem("signupData");
          setError(signupResponse.message);
        } else {
          const errorMsg =
            signupResponse.message || "Failed to complete signup";
          setError(errorMsg);
        }
      } else {
        const errorMsg = verifyResponse.message || "Invalid OTP";
        setError(errorMsg);
      }
    } catch (error) {
      const errorMsg = "An unexpected error occurred. Please try again.";
      setError(errorMsg);

      console.error("Verification error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtp = () => {
    const otp = inputRef.current.map((input) => input.value).join("");

    if (otp.length !== 6) {
      const errorMsg = "Please enter a valid 6-digit OTP";
      setError(errorMsg);
      return;
    }

    getOpt(otp);
    verifyOtp(otp);
  };

  const startResendTimer = () => {
    setResendTimer(30);
    const timer = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;

    setError("");
    setIsLoading(true);

    try {
      const data = JSON.parse(localStorage.getItem("signupData"));
      if (!data) {
        const errorMsg = "Signup data not found. Please try again.";
        setError(errorMsg);

        return;
      }

      const [response, error] = await sendData(
        `${configFile.apiUrl}/react/requestOtp`,
        { email: data.email }
      );

      if (error) {
        const errorMsg = error.message || "Failed to resend OTP";
        setError(errorMsg);

        return;
      }

      if (response.success) {
        setError("New OTP has been sent to your email");
        startResendTimer();
        inputRef.current.forEach((input) => {
          if (input) input.value = "";
        });
        inputRef.current[0]?.focus();
      } else {
        const errorMsg = response.message || "Failed to resend OTP";
        setError(errorMsg);
      }
    } catch (error) {
      const errorMsg = "An unexpected error occurred while resending OTP";
      setError(errorMsg);

      console.error("Resend error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="overlay">
      <div className="box">
        <p>Please check your email</p>
        <p>A verification code has been sent to your email</p>
        <div className="inputbox">
          {Array.from({ length: 6 }).map((_, index) => (
            <input
              type="text"
              maxLength="1"
              key={index}
              ref={(elem) => (inputRef.current[index] = elem)}
              onChange={(e) => handleChange(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              disabled={isLoading}
            />
          ))}
        </div>
        {error && <p className="error-message">{error}</p>}
        <div className="button">
          <button onClick={handleOtp} disabled={isLoading}>
            {isLoading ? "Verifying..." : "Verify"}
          </button>
          <p>
            Didn't receive email?{" "}
            <a href="#" onClick={handleResendOtp}>
              Resend
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Otp;

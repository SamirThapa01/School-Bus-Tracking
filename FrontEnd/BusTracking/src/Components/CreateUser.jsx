import React, { useState } from "react";
import axios from "axios"; 
import "./Signup.css";
import configFile from "../Config/ApiConfig";

const CreateUser = ({ modle }) => {
  const [data, setData] = useState({
    name: "",
    age: "",
    grade: "",
    contact: "",
    email: "",
    rfid: "",
    password: "", 
  });

  const [errors, setErrors] = useState({
    name: "",
    age: "",
    grade: "",
    contact: "",
    email: "",
    rfid: "",
    password: "", 
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setData({ ...data, [name]: value });

    if (name === "name") {
      setErrors({ ...errors, name: value ? "" : "Name is required" });
    } else if (name === "email") {
      setErrors({
        ...errors,
        email: value.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i)
          ? ""
          : "Invalid email address",
      });
    } else if (name === "contact") {
      setErrors({
        ...errors,
        contact: value.length === 10 ? "" : "Contact number must be 10 digits",
      });
    } else if (name === "rfid") {
      setErrors({
        ...errors,
        rfid: value.length > 0 ? "" : "RFID is required",
      });
    } else if (name === "password") {
      setErrors({
        ...errors,
        password:
          value.length >= 8
            ? ""
            : "Password must be at least 8 characters long",
      });
    }
  };

  const handleCreate = async () => {
   
    if (
      !data.name ||
      !data.age ||
      !data.grade ||
      !data.contact ||
      !data.email ||
      !data.rfid ||
      !data.password
    ) {
      alert("Please fill in all fields");
      return;
    }

    try {
    
      const response = await axios.post(
        `${configFile.apiUrl}/react/admin/insertDetails`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

     
      if (response.status === 201) {
        alert("Student created successfully");
        modle();
      }
    } catch (error) {
    
      console.error("Error creating student:", error);
      alert("An error occurred while creating the student. Please try again.");
    }
  };

  return (
    <div className="user-details">
      <form>
        <div>
          <h2>Add Student</h2>
        </div>
        <div className="top-row">
          <div className="form-group">
            <label htmlFor="name">Name:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={data.name}
              onChange={handleChange}
            />
            {errors.name && (
              <p style={{ color: "red", fontSize: "14px" }}>{errors.name}</p>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              required
              id="email"
              name="email"
              value={data.email}
              onChange={handleChange}
            />
            {errors.email && <p style={{ color: "red" }}>{errors.email}</p>}
          </div>
        </div>
        <div className="middle-row">
          <div className="form-group">
            <label htmlFor="age">Age:</label>
            <input
              type="number"
              id="age"
              name="age"
              value={data.age}
              onChange={handleChange}
            />
            {errors.age && <p style={{ color: "red" }}>{errors.age}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="grade">Grade:</label>
            <input
              type="text"
              id="grade"
              name="grade"
              value={data.grade}
              onChange={handleChange}
            />
            {errors.grade && <p style={{ color: "red" }}>{errors.grade}</p>}
          </div>
        </div>
        <div className="middle-row">
          <div className="form-group">
            <label htmlFor="contact">Contact:</label>
            <input
              type="number"
              id="contact"
              name="contact"
              value={data.contact}
              onChange={handleChange}
            />
            {errors.contact && <p style={{ color: "red" }}>{errors.contact}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="rfid">RFID:</label>
            <input
              type="text"
              id="rfid"
              name="rfid"
              value={data.rfid}
              onChange={handleChange}
            />
            {errors.rfid && <p style={{ color: "red" }}>{errors.rfid}</p>}
          </div>
        </div>

       
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={data.password}
            onChange={handleChange}
          />
          {errors.password && <p style={{ color: "red" }}>{errors.password}</p>}
        </div>

        <button type="button" onClick={handleCreate}>
          Create
        </button>
        <button
          type="button"
          onClick={() => {
            modle();
          }}
        >
          Cancel
        </button>
      </form>
    </div>
  );
};

export default CreateUser;

import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Signup.css";
import configFile from "../Config/ApiConfig";

const EditUser = ({ modle, Userdata, setIsEditUserVisible }) => {
  const [data, setData] = useState({
    name: "",
    age: "",
    grade: "",
    contact: "",
    email: "",
    rfid: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    age: "",
    grade: "",
    contact: "",
    email: "",
    rfid: "",
  });

  useEffect(() => {
    console.log("Userdata:", Userdata);
    if (Userdata) {
      setData({
        name: Userdata.student_name || "",
        age: Userdata.age || "",
        grade: Userdata.grade || "",
        contact: Userdata.contact_number || "",
        email: Userdata.parent_email || "",
        rfid: Userdata.rfid_tag_id || "",
      });
    }
  }, [Userdata]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setData({ ...data, [name]: value });

    // Validation for each field
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
      !data.rfid
    ) {
      alert("Please fill in all fields");
      return;
    }

    try {
      const response = await axios.patch(
        `${configFile.apiUrl}/react/admin/updateStudent/${Userdata.student_id}`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        alert("Student updated successfully");
        setIsEditUserVisible(false);
      }
    } catch (error) {
      console.error("Error updating student:", error);
      console.error(
        "Error updating student:",
        error.response ? error.response.data : error.message
      );
      alert(
        "Failed to update student: " +
          (error.response ? error.response.data.message : error.message)
      );
    }
  };

  return (
    <div className="user-details">
      {console.log(Userdata)}
      <form>
        <div>
          <h2>Edit User Details</h2>
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

        <button type="button" onClick={handleCreate}>
          Edit
        </button>
        <button
          type="button"
          onClick={() => {
            setIsEditUserVisible(false);
          }}
        >
          Cancel
        </button>
      </form>
    </div>
  );
};

export default EditUser;

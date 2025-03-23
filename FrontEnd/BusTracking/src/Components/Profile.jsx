import React, { useState } from "react";
import "./Signup.css";

function Profile() {
  // State object to manage both parent and student information
  const [profileData, setProfileData] = useState({
    parentId: "P-2025-0042",
    parentPhone: "(555) 123-4567",
    parentEmail: "john.smith@example.com",
    studentId: "S-2025-1084",
    studentName: "Emily Smith",
    studentGrade: "5th Grade",
    studentRfidTag: "A67B2C45D90E",
    studentAge: 10,
  });

  // Handle changes to the input fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle saving data (e.g., sending data to API or saving locally)
  const handleSave = () => {
    console.log("Saving data...");
    console.log(profileData);
  };

  // Handle canceling (e.g., resetting to the original values)
  const handleCancel = () => {
    setProfileData({
      parentId: "01",
      parentPhone: "9823455344",
      parentEmail: "salinthapa633@gmail.com",
      studentId: "02",
      studentName: "samirThapa",
      studentGrade: "5th Grade",
      studentRfidTag: "A67B2C45D90E",
      studentAge: 10,
    });
  };

  return (
    <div className="profile-card">
      <div className="header">
        <h1>Parent-Student Information</h1>
        <p>School Management System</p>
      </div>

      <div className="divide-section">
        <div className="info-section">
          <div className="info-row">
            <div className="label">Parent ID:</div>
            <div className="value">
              <input
                type="text"
                name="parentId"
                value={profileData.parentId}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="info-row">
            <div className="label">Phone:</div>
            <div className="value">
              <input
                type="tel"
                name="parentPhone"
                value={profileData.parentPhone}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="info-row">
            <div className="label">Email:</div>
            <div className="value">
              <input
                type="email"
                name="parentEmail"
                value={profileData.parentEmail}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="student-section">
          <div className="info-row">
            <div className="label">Student ID:</div>
            <div className="value">
              <input
                type="text"
                name="studentId"
                value={profileData.studentId}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="info-row">
            <div className="label">Name:</div>
            <div className="value">
              <input
                type="text"
                name="studentName"
                value={profileData.studentName}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="info-row">
            <div className="label">Age:</div>
            <div className="value">
              <input
                type="number"
                name="studentAge"
                value={profileData.studentAge}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="info-row">
            <div className="label">Grade:</div>
            <div className="value">
              <select
                name="studentGrade"
                value={profileData.studentGrade}
                onChange={handleChange}
              >
                <option>Kindergarten</option>
                <option>1st Grade</option>
                <option>2nd Grade</option>
                <option>3rd Grade</option>
                <option>4th Grade</option>
                <option>5th Grade</option>
                <option>6th Grade</option>
                <option>7th Grade</option>
                <option>8th Grade</option>
                <option>9th Grade</option>
                <option>10th Grade</option>
                <option>11th Grade</option>
                <option>12th Grade</option>
              </select>
            </div>
          </div>

          <div className="info-row">
            <div className="label">RFID Tag:</div>
            <div className="value">
              <input
                type="text"
                name="studentRfidTag"
                className="rfid-tag"
                value={profileData.studentRfidTag}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="button-div">
        <button type="button" onClick={handleCancel}>
          Cancel
        </button>
        <button type="button" onClick={handleSave}>
          Save
        </button>
      </div>
    </div>
  );
}

export default Profile;

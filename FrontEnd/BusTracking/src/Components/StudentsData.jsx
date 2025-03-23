import React, { useState } from "react";
import "./Signup.css";

function StudentsData() {
  // Object to hold all form data
  const [studentData, setStudentData] = useState({
    parentId: "P-2025-0042",
    studentName: "John Smith",
    grade: "5th",
    rfidTag: "A67B2C45D90E",
  });

  // Handle changes to the form fields using the object
  const handleChange = (e) => {
    const { name, value } = e.target;
    setStudentData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle saving data (e.g., send data to API)
  const handleSave = () => {
    console.log("Saving data...");
    console.log(studentData);
  };

  // Handle canceling (e.g., reset to original values)
  const handleCancel = () => {
    setStudentData({
      parentId: "01",
      studentName: "Samir Thapa",
      grade: "5th",
      rfidTag: "A67B2C45D90c",
    });
  };

  return (
    <div className="student-card">
      <div className="divide-section">
        <div className="info-section">
          <div className="info-row">
            <div className="label">Parent ID:</div>
            <div className="value">
              <input
                type="number"
                name="parentId"
                value={studentData.parentId}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="info-row">
            <div className="label">Student Name:</div>
            <div className="value">
              <input
                type="text"
                name="studentName"
                value={studentData.studentName}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="info-row">
            <div className="label">Grade:</div>
            <div className="value">
              <input
                type="text"
                name="grade"
                value={studentData.grade}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="info-row">
            <div className="label">RFID Tag:</div>
            <div className="value">
              <input
                type="text"
                name="rfidTag"
                className="rfid-tag"
                value={studentData.rfidTag}
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

export default StudentsData;

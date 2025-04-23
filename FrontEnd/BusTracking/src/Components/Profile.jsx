import React, { useEffect, useState } from "react";
import "./Signup.css";
import axios from "axios";
import configFile from "../Config/ApiConfig";

function Profile() {
  const [profileData, setProfileData] = useState({
    parentId: "",
    parentPhone: "",
    parentEmail: "",
    studentId: "",
    studentName: "",
    studentGrade: "",
    studentRfidTag: "",
    studentAge: 0,
  });
  const [data, setData] = useState(null);
  const [isStudentMissing, setIsStudentMissing] = useState(false);

  // Handle changes to the input fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${configFile.apiUrl}/react/profile`, {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        });
        console.log("API response:", response.data);
        console.log("Profile data:", response.data.message);

        // Check if the API response contains a message indicating missing student data
        if (
          response.data.message ===
          "Student data is missing. Please fill in student details."
        ) {
          setIsStudentMissing(true);
        } else {
          const profile = response.data;

          // Set profile data into state
          setProfileData({
            parentId: profile.parent_id || "",
            parentPhone: profile.contact_number || "",
            parentEmail: profile.email || "",
            studentId: profile.student_id || "",
            studentName: profile.student_name || "",
            studentGrade: profile.grade || "",
            studentRfidTag: profile.rfid_tag_id || "",
            studentAge: profile.age || 0,
          });
          setData(profile);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleSave = async () => {
    try {
      const response = await axios.post(
        `${configFile.apiUrl}/react/insert/student`,
        profileData,
        {
          withCredentials: true,
        }
      );
      console.log("API response:", response.data); // Log the response for debugging
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };

  const handleCancel = () => {
    if (data) {
      setProfileData({
        parentId: data.parent_id || "",
        parentPhone: data.contact_number || "",
        parentEmail: data.email || "",
        studentId: data.student_id || "",
        studentName: data.student_name || "",
        studentGrade: data.grade || "",
        studentRfidTag: data.rfid_tag_id || "",
        studentAge: data.age || 0,
      });
    }
  };

  if (!data && !isStudentMissing) {
    return <div>Loading...</div>;
  }

  // If studentId is missing, show the form to fill in student details
  if (isStudentMissing) {
    return (
      <div className="profile-card">
        <div className="header">
          <h1>Fill Student Details</h1>
          <p>School Management System</p>
        </div>

        <div className="divide-section">
          <div className="student-section">
            <div className="info-row">
              <div className="label">Student Name:</div>
              <div className="value">
                <input
                  type="text"
                  name="studentName"
                  value={profileData.studentName || ""}
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
                  value={profileData.studentAge || 0}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="info-row">
              <div className="label">Grade:</div>
              <div className="value">
                <input
                  type="text"
                  name="studentGrade"
                  value={profileData.studentGrade || ""}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="info-row">
              <div className="label">RFID Tag:</div>
              <div className="value">
                <input
                  type="text"
                  name="studentRfidTag"
                  value={profileData.studentRfidTag || ""}
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

  // Default Profile View (when studentId exists)
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
                disabled
                value={profileData.parentId || ""}
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
                value={profileData.parentPhone || ""}
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
                value={profileData.parentEmail || ""}
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
                disabled
                value={profileData.studentId || ""}
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
                value={profileData.studentName || ""}
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
                value={profileData.studentAge || 0}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="info-row">
            <div className="label">Grade:</div>
            <div className="value">
              <input
                type="text"
                name="studentGrade"
                value={profileData.studentGrade || ""}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="info-row">
            <div className="label">RFID Tag:</div>
            <div className="value">
              <input
                type="text"
                name="studentRfidTag"
                value={profileData.studentRfidTag || ""}
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

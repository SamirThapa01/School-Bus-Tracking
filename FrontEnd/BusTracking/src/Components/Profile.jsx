import React, { useEffect, useState } from "react";
import "./Signup.css";
import axios from "axios";

function Profile() {
  // State objects for both parent and student information
  const [profileData, setProfileData] = useState({
    parentId: "",
    parentPhone: "",
    parentEmail: "",
    studentId: "",
    studentName: "",
    studentGrade: "",
    studentRfidTag: "",
    studentAge: 0, // Ensure it’s a number, not undefined
  });
  const [data, setData] = useState(null); // Initializing with null to check for data loading

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
        const response = await axios.get(
          "http://localhost:8000/react/profile",
          {
            withCredentials: true,
          }
        );
        console.log("API response:", response.data); // Log the response for debugging

        // Check if the response is an array and take the first element
        const profile = response.data[0]; // Get the first object in the array

        // Set profile data into state
        if (profile) {
          setProfileData({
            parentId: profile.parent_id || "", // Add default empty string if undefined
            parentPhone: profile.contact_number || "",
            parentEmail: profile.email || "",
            studentId: profile.student_id || "",
            studentName: profile.student_name || "",
            studentGrade: profile.grade || "",
            studentRfidTag: profile.rfid_tag_id || "",
            studentAge: profile.age || 0, // Ensure a default number
          });
        }

        // Set the fetched profile into a separate state if needed
        setData(profile);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []); 


  const handleSave = () => {
    console.log("Saving data...");
    console.log(profileData);
    // Implement save functionality (e.g., API request to save updated profile)
  };

  // Handle canceling (e.g., resetting to the original values)
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

  if (!data) {
    return <div>Loading...</div>;
  }

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
                value={profileData.studentGrade || ""} // Ensuring controlled input
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
                className="rfid-tag"
                value={profileData.studentRfidTag || ""} // Ensuring controlled input
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

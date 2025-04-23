import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Signup.css";
import configFile from "../Config/ApiConfig";

const EditAttendance = ({ userData, setIsAttendanceVisible }) => {
  const [data, setData] = useState({
    status: "",
    attendance_id: "",
  });

  const [errors, setErrors] = useState({
    status: "",
  });

  useEffect(() => {
    console.log("userData:", userData);
    if (userData) {
      setData({
        status: userData.status || "Present",
        attendance_id: userData.attendance_id || "Missed",
      });
    }
  }, [userData]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setData({ ...data, [name]: value });

    if (name === "status") {
      setErrors({ ...errors, status: value ? "" : "Status is required" });
    }
  };

  const handleUpdate = async () => {
    if (!data.status) {
      alert("Please select an attendance status");
      return;
    }

    try {               
      const endpoint = `${configFile.apiUrl}/react/admin/updateAttendance/${userData.student_id}/${data.attendance_id}`;

      const response = await axios.put(
        endpoint,
        {
          status: data.status,
          attendance_id: data.attendance_id,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        alert("Attendance updated successfully");
        setIsAttendanceVisible(false);
        window.location.reload();
      }
    } catch (error) {
      console.error("Error updating attendance:", error);
      console.error(
        "Error updating attendance:",
        error.response ? error.response.data : error.message
      );
      alert(
        "Failed to update attendance: " +
          (error.response ? error.response.data.message : error.message)
      );
    }
  };

  return (
    <div className="user-details">
      {console.log(userData)}
      <form>
        <div>
          <h2>Edit Attendance</h2>
        </div>
        <div className="top-row">
          <div className="form-group">
            <label>Student Name:</label>
            <input
              type="text"
              value={userData?.student_name || ""}
              readOnly
              disabled
              className="readonly-field"
            />
          </div>
          <div className="form-group">
            <label>Grade:</label>
            <input
              type="text"
              value={userData?.grade || ""}
              readOnly
              disabled
              className="readonly-field"
            />
          </div>
        </div>
        <div className="middle-row">
          <div className="form-group">
            <label>Attendance ID:</label>
            <input
              type="text"
              value={data.attendance_id || ""}
              readOnly
              disabled
              className="readonly-field"
              placeholder="No attendance ID available"
            />
          </div>
          <div className="form-group">
            <label htmlFor="status">Attendance Status:</label>
            <select
              id="status"
              name="status"
              value={data.status}
              onChange={handleChange}
              className="select-status"
            >
              <option value="Missed">Missed</option>
              <option value="Excused">Excused</option>
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
              <option value="Late">Late</option>
            </select>
            {errors.status && <p style={{ color: "red" }}>{errors.status}</p>}
          </div>
        </div>

        <button type="button" onClick={handleUpdate}>
          Update
        </button>
        <button
          type="button"
          onClick={() => {
            setIsAttendanceVisible(false);
          }}
        >
          Cancel
        </button>
      </form>

      {/* Additional inline styles to match existing CSS */}
      <style jsx>{`
        .readonly-field {
          background-color: #f4f4f4;
          cursor: not-allowed;
        }
        .select-status {
          width: 100%;
          padding: 8px;
          border: 1px solid #ccc;
          border-radius: 4px;
          font-size: 16px;
        }
      `}</style>
    </div>
  );
};

export default EditAttendance;

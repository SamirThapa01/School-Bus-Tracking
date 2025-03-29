import React, { useEffect, useState } from "react";
import { Home, Users, Bus, Plus, School } from "lucide-react";
import axios from "axios";
import DataTable from "./DataTable";
import "./Signup.css";
import NavBar from "./NavBar";

function AdminPanel({ logins, handleLoginClick, login }) {
  const [activeTab, setActiveTab] = useState("home");
  const [selectedGrade, setSelectedGrade] = useState("all");
  const [students, setStudents] = useState([]);
  const [buses, setBuses] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [parents, setParents] = useState([]);
  const [others, setOthers] = useState([]);
  const [selectedClassDate, setSelectedClassDate] = useState(""); 
  const [selectedStatus, setSelectedStatus] = useState("all"); 

  // Fetch students
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axios.get("http://localhost:8000/react/get/Allstudents");
        setStudents(response.data.students);
      } catch (error) {
        console.error("Error fetching students:", error);
      }
    };
    fetchStudents();
  }, [activeTab]);

  // Fetch attendance
  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const response = await axios.get("http://localhost:8000/react/get/Attendance");
        setAttendance(response.data.attendance);
      } catch (error) {
        console.error("Error fetching attendance:", error);
      }
    };
    fetchAttendance();
  }, [activeTab]);

  // Fetch parents
  useEffect(() => {
    const fetchParents = async () => {
      try {
        const response = await axios.get("http://localhost:8000/react/get/AllParents");
        setParents(response.data.parents);
      } catch (error) {
        console.error("Error fetching parents:", error);
      }
    };
    fetchParents();
  }, [activeTab]);

  // Fetch other users (staff/admin/etc.)
  useEffect(() => {
    const fetchOthers = async () => {
      try {
        const response = await axios.get("http://localhost:8000/react/get/AllOthers");
        setOthers(response.data.others);
      } catch (error) {
        console.error("Error fetching others:", error);
      }
    };
    fetchOthers();
  }, [activeTab]);

  const filteredStudents = selectedGrade === "all" ? students : students.filter(student => student.grade === selectedGrade);

  const filteredAttendance = attendance.filter(record => {
    const classDateMatch = selectedClassDate ? record.classDate === selectedClassDate : true;
    const statusMatch = selectedStatus !== "all" ? record.status === selectedStatus : true;
    return classDateMatch && statusMatch;
  });

  const studentColumns = ["St. Id", "Name", "Age", "Grade", "Pa.ID", "Contact", "P.Email", "Rfid"];
  const attendanceColumns = ["Class Name", "Class Date", "Status", "Student Name"];
  const busColumns = ["Bus ID", "Bus Number", "Route", "Capacity", "Driver"];

  return (
    <>
      
      <div className="admin-container">
        <aside className="sidebar">
          <h1><School /> Bus Management</h1>
          <span className="spantag"></span>
          <nav>
            <button onClick={() => setActiveTab("home")} className={activeTab === "home" ? "active" : ""}>
              <Home /> <span>Home</span>
            </button>
            <button onClick={() => setActiveTab("buses")} className={activeTab === "buses" ? "active" : ""}>
              <Bus /> <span>Buses</span>
            </button>
            <button onClick={() => setActiveTab("students")} className={activeTab === "students" ? "active" : ""}>
              <Users /> <span>Students</span>
            </button>
            <button onClick={() => setActiveTab("attendance")} className={activeTab === "attendance" ? "active" : ""}>
              <Users /> <span>Attendance</span>
            </button>
          </nav>
        </aside>

        <main className="content">
          {/* Dashboard - Home */}
          {activeTab === "home" && (
            <div className="dashboard">
              <div className="card">Total Students: {students.length}</div>
              <div className="card">Total Buses: {buses.length}</div>
              <div className="card">Total Parents: {parents.length}</div>
              <div className="card">Total Others: {others.length}</div>
            </div>
          )}

          {/* Student Management */}
          {activeTab === "students" && (
            <div className="management">
              <h2>Student Management</h2>
              <button className="add-button">
                <Plus /> Add Student
              </button>
              <div className="filters">
                <label>
                  <input type="radio" name="grade" value="all" checked={selectedGrade === "all"} onChange={() => setSelectedGrade("all")} /> All
                </label>
                {["9th", "10th", "11th", "12th"].map(grade => (
                  <label key={grade}>
                    <input type="radio" name="grade" value={grade} checked={selectedGrade === grade} onChange={() => setSelectedGrade(grade)} /> {grade}
                  </label>
                ))}
              </div>
              <DataTable columns={studentColumns} rows={filteredStudents} />
            </div>
          )}

          {/* Bus Management */}
          {activeTab === "buses" && (
            <div className="management">
              <h2>Bus Management</h2>
              <button className="add-button">
                <Plus /> Add Bus
              </button>
              <DataTable columns={busColumns} rows={buses} />
            </div>
          )}

          {/* Attendance Management */}
          {activeTab === "attendance" && (
            <div className="management">
              <h2>Attendance Management</h2>
              <div className="filters">
                <label>
                  Class Date:
                  <input type="date" value={selectedClassDate} onChange={(e) => setSelectedClassDate(e.target.value)} />
                </label>
                <label>
                  Status:
                  <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                    <option value="all">All</option>
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                  </select>
                </label>
              </div>
              <DataTable columns={attendanceColumns} rows={filteredAttendance} />
            </div>
          )}
        </main>
      </div>
    </>
  );
}

export default AdminPanel;

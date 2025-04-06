import React, { useEffect, useState } from "react";
import { Home, Users, Bus, Plus, School } from "lucide-react";
import axios from "axios";
import DataTable from "./DataTable";
import "./Signup.css";
import NavBar from "./NavBar";
import CreateUser from "./CreateUser";

function AdminPanel({ logins, handleLoginClick, login }) {
  const [activeTab, setActiveTab] = useState("home");
  const [isCreateUserVisible, setIsCreateUserVisible] = useState(false);
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
        const response = await axios.get(
          "http://localhost:8000/react/get/Allstudents"
        );
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
        const response = await axios.get(
          "http://localhost:8000/react/admin/attendance"
        );
        setAttendance(response.data.data);
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
        const response = await axios.get(
          "http://localhost:8000/react/get/AllParents"
        );
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
        const response = await axios.get(
          "http://localhost:8000/react/get/AllOthers"
        );
        setOthers(response.data.others);
      } catch (error) {
        console.error("Error fetching others:", error);
      }
    };
    fetchOthers();
  }, [activeTab]);

  const filteredStudents =
    selectedGrade === "all"
      ? students
      : students.filter((student) => student.grade === selectedGrade);

  const filteredAttendance = attendance.filter((record) => {
    // If selectedClassDate is provided, filter by the formatted scan_time (date)
    let classDateMatch = true;
    if (selectedClassDate && selectedClassDate.trim() !== "") {
      // Make sure scan_time exists before trying to slice it
      classDateMatch = record.scan_time ? record.scan_time.slice(0, 10) === selectedClassDate : false;
    }

    // Filter by grade if selectedGrade is not 'all'
    // Handle the varchar type from backend by ensuring string comparison
    const gradeMatch = selectedGrade !== "all" 
      ? String(record.grade) === String(selectedGrade) 
      : true;

    // Filter by status if selectedStatus is not 'all'
    const statusMatch =
      selectedStatus !== "all" ? String(record.status).toLowerCase() === selectedStatus.toLowerCase() : true;

    return classDateMatch && gradeMatch && statusMatch;
  });

  const studentColumns = [
    "St. Id",
    "Name",
    "Age",
    "Grade",
    "Pa.ID",
    "Contact",
    "P.Email",
    "Rfid",
  ];
  const attendanceColumns = ["Grade", "Id", "Status", "Date", "Name", "Bus-id"];
  const busColumns = ["Bus ID", "Bus Number", "Route", "Capacity", "Driver"];
  
  const closeModal = () => {
    setIsCreateUserVisible((prev) => !prev);
  };

  return (
    <>
      <div className="admin-container">
        <aside className="sidebar">
          <h1>
            <School /> Bus Management
          </h1>
          <span className="spantag"></span>
          <nav>
            <button
              onClick={() => setActiveTab("home")}
              className={activeTab === "home" ? "active" : ""}
            >
              <Home /> <span>Home</span>
            </button>
            <button
              onClick={() => setActiveTab("buses")}
              className={activeTab === "buses" ? "active" : ""}
            >
              <Bus /> <span>Buses</span>
            </button>
            <button
              onClick={() => setActiveTab("students")}
              className={activeTab === "students" ? "active" : ""}
            >
              <Users /> <span>Students</span>
            </button>
            <button
              onClick={() => setActiveTab("attendance")}
              className={activeTab === "attendance" ? "active" : ""}
            >
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
              <button
                className="add-button"
                onClick={() => setIsCreateUserVisible(true)}
              >
                <Plus /> Add Student
              </button>
              {isCreateUserVisible && <CreateUser modle={closeModal} />}
              <div className="filters">
                <label>
                  Grade:
                  <select
                    value={selectedGrade}
                    onChange={(e) => setSelectedGrade(e.target.value)}
                  >
                    <option value="all">All Grades</option>
                    {["9th", "10th", "11th", "12th"].map((grade) => (
                      <option key={grade} value={grade}>
                        {grade}
                      </option>
                    ))}
                  </select>
                </label>
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
              <DataTable
                columns={busColumns}
                rows={buses}
                setActiveTab={setActiveTab}
                activeTab={activeTab}
              />
            </div>
          )}

          {/* Attendance Management */}
          {activeTab === "attendance" && (
            <div className="management">
              <h2>Attendance Management</h2>
              <div className="filters">
                <label>
                  Class Date:
                  <input
                    type="date"
                    placeholder="YYYY-MM-DD"
                    value={selectedClassDate}
                    onChange={(e) => setSelectedClassDate(e.target.value)}
                  />
                </label>
                <label>
                  Status:
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    <option value="all">All Statuses</option>
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                  </select>
                </label>
                <label>
                  Grade:
                  <select
                    value={selectedGrade}
                    onChange={(e) => setSelectedGrade(e.target.value)}
                  >
                    <option value="all">All Grades</option>
                    {["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"].map(
                      (grade) => (
                        <option key={grade} value={grade}>
                          {grade}
                        </option>
                      )
                    )}
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

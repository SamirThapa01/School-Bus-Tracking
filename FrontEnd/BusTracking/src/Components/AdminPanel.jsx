import React, { useState } from "react";
import { Home, Users, Bus, Edit, Trash2, Plus, Check, X } from "lucide-react";
import "./Signup.css";

const initialBuses = [
  {
    id: 1,
    number: "BUS-001",
    route: "North Route",
    capacity: 45,
    driver: "John Doe",
  },
  {
    id: 2,
    number: "BUS-002",
    route: "South Route",
    capacity: 40,
    driver: "Jane Smith",
  },
];

const initialStudents = [
  {
    id: 1,
    name: "Alice Johnson",
    grade: "10th",
    busNumber: "BUS-001",
    contact: "123-456-7890",
    attendance: 'p'
  },
  {
    id: 2,
    name: "Bob Smith",
    grade: "9th",
    busNumber: "BUS-002",
    contact: "123-456-7891",
    attendance: 'p'
  },
];

function AdminPanel() {
  const [activeTab, setActiveTab] = useState("home");
  const [selectedGrade, setSelectedGrade] = useState("all");
  const [buses] = useState(initialBuses);
  const [students, setStudents] = useState(initialStudents);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  const filteredStudents =
    selectedGrade === "all"
      ? students
      : students.filter((student) => student.grade === selectedGrade);

  const handleEdit = (student) => {
    setEditingId(student.id);
    setEditData({ ...student });
  };

  const handleChange = (e, field) => {
    setEditData({ ...editData, [field]: e.target.value });
  };

  const handleSave = () => {
    setStudents(students.map(student => 
      student.id === editingId ? editData : student
    ));
    setEditingId(null);
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  return (
    <div className="admin-container">
      <aside className="sidebar">
        <h1>Bus Management</h1>
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
            <Users /> <span>student</span>
          </button>
        </nav>
      </aside>

      <main className="content">
        {activeTab === "home" && (
          <div className="dashboard">
            <div className="card">Total Buses: {buses.length}</div>
            <div className="card">Total Students: {students.length}</div>
          </div>
        )}

        {activeTab === "buses" && (
          <div className="management">
            <h2>Bus Management</h2>
            <button className="add-button">
              <Plus /> Add Bus
            </button>
            <table>
              <thead>
                <tr>
                  <th>Bus Number</th>
                  <th>Route</th>
                  <th>Capacity</th>
                  <th>Driver</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {buses.map((bus) => (
                  <tr key={bus.id}>
                    <td>{bus.number}</td>
                    <td>{bus.route}</td>
                    <td>{bus.capacity}</td>
                    <td>{bus.driver}</td>
                    <td>
                      <button className="edit">
                        <Edit />
                      </button>
                      <button className="delete">
                        <Trash2 />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "students" && (
          <div className="management">
            <h2>Student Management</h2>
            <button className="add-button">
              <Plus /> Add Student
            </button>
            <div className="filters">
              <label>
                <input
                  type="radio"
                  name="grade"
                  value="all"
                  checked={selectedGrade === "all"}
                  onChange={() => setSelectedGrade("all")}
                />{" "}
                All
              </label>
              {["9th", "10th", "11th", "12th"].map((grade) => (
                <label key={grade}>
                  <input
                    type="radio"
                    name="grade"
                    value={grade}
                    checked={selectedGrade === grade}
                    onChange={() => setSelectedGrade(grade)}
                  />{" "}
                  {grade}
                </label>
              ))}
            </div>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Grade</th>
                  <th>Rfid</th>
                  <th>Contact</th>
                  <th>Attendence</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student.id}>
                    <td>
                      {editingId === student.id ? (
                        <input
                          type="text"
                          value={editData.name}
                          onChange={(e) => handleChange(e, 'name')}
                          autoFocus
                        />
                      ) : (
                        student.name
                      )}
                    </td>
                    <td>
                      {editingId === student.id ? (
                        <input
                          type="text"
                          value={editData.grade}
                          onChange={(e) => handleChange(e, 'grade')}
                        />
                      ) : (
                        student.grade
                      )}
                    </td>
                    <td>
                      {editingId === student.id ? (
                        <input
                          type="text"
                          value={editData.busNumber}
                          onChange={(e) => handleChange(e, 'busNumber')}
                        />
                      ) : (
                        student.busNumber
                      )}
                    </td>
                    <td>
                      {editingId === student.id ? (
                        <input
                          type="text"
                          value={editData.contact}
                          onChange={(e) => handleChange(e, 'contact')}
                        />
                      ) : (
                        student.contact
                      )}
                    </td>
                    <td>
                      {editingId === student.id ? (
                        <input
                          type="text"
                          value={editData.attendance}
                          onChange={(e) => handleChange(e, 'attendance')}
                        />
                      ) : (
                        student.attendance
                      )}
                    </td>
                    <td>
                      {editingId === student.id ? (
                        <>
                          <button className="save" onClick={handleSave}>
                            <Check />
                          </button>
                          <button className="cancel" onClick={handleCancel}>
                            <X />
                          </button>
                        </>
                      ) : (
                        <>
                          <button className="edit" onClick={() => handleEdit(student)}>
                            <Edit />
                          </button>
                          <button className="delete">
                            <Trash2 />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminPanel;
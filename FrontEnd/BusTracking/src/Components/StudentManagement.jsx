import React, { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "./DataTable";
import CreateUser from "./CreateUser";
import { Plus } from "lucide-react";
import EditUser from "./EditUser";

const StudentManagement = ({
  students,
  isEditUserVisible,
  setIsEditUserVisible,
  isCreateUserVisible,
  setIsCreateUserVisible,
  selectedGrade,
  setSelectedGrade,
  activeTab,
}) => {
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
  const [userData, setUserData] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  console.log(students);

  // Filter students by grade
  const filteredByGrade =
    selectedGrade === "all"
      ? students
      : students.filter((student) => student.grade === selectedGrade);

  // Filter students by search term
  const filteredStudents = searchTerm
    ? filteredByGrade.filter(
        (student) =>
          student.student_name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          student.age.toString().includes(searchTerm) ||
          student.grade.includes(searchTerm)
      )
    : filteredByGrade;

  return (
    <div className="management">
      <h2>Student Management</h2>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search by name, age, or grade"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
            }}
          />
        </div>
        <div className="filters" style={{ padding: "0 20px" }}>
          <label>
            Grade:
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
            >
              <option value="all">All Grades</option>
              {[
                "1",
                "2",
                "3",
                "4",
                "5",
                "6",
                "7",
                "8",
                "9",
                "10",
                "11",
                "12",
              ].map((grade) => (
                <option key={grade} value={grade}>
                  {grade}
                </option>
              ))}
            </select>
          </label>
        </div>
        <button
          className="add-button"
          onClick={() => setIsCreateUserVisible(true)}
        >
          <Plus /> Add Student
        </button>
      </div>
      {isCreateUserVisible && (
        <CreateUser modle={() => setIsCreateUserVisible(false)} />
      )}
      {isEditUserVisible && (
        <EditUser
          setIsEditUserVisible={setIsEditUserVisible}
          Userdata={userData}
        />
      )}
      <DataTable
        columns={studentColumns}
        rows={filteredStudents}
        isEditUserVisible={isEditUserVisible}
        setIsEditUserVisible={setIsEditUserVisible}
        setUserData={setUserData}
        activeTab={activeTab}
      />
    </div>
  );
};

export default StudentManagement;

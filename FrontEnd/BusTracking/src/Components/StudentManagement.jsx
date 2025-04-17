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
  console.log(students);
  const filteredStudents =
    selectedGrade === "all"
      ? students
      : students.filter((student) => student.grade === selectedGrade);

  return (
    <div className="management">
      <h2>Student Management</h2>
      <button
        className="add-button"
        onClick={() => setIsCreateUserVisible(true)}
      >
        <Plus /> Add Student
      </button>
      {isCreateUserVisible && (
        <CreateUser modle={() => setIsCreateUserVisible(false)} />
      )}
      {isEditUserVisible && (
        <EditUser
          setIsEditUserVisible={setIsEditUserVisible}
          Userdata={userData}
        />
      )}
      <div className="filters">
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

import React from "react";
import DataTable from "./DataTable";
import EditAttendance from "./EditAttendance";
import EditUser from "./EditUser";
import { useState } from "react";

const AttendanceManagement = ({
  attendance,
  selectedClassDate,
  setSelectedClassDate,
  selectedStatus,
  setSelectedStatus,
  selectedGrade,
  setSelectedGrade,
  activeTab,
  setIsAttendanceVisible,
  isAttendanceVisible,
}) => {
  const attendanceColumns = ["A.Id", "S.Id", "Status", "Date", "Name", "Grade"];
  const [userData, setUserData] = useState({});

  const filteredAttendance = attendance.filter((record) => {
    let classDateMatch = true;
    if (selectedClassDate && selectedClassDate.trim() !== "") {
      classDateMatch = record.scan_time
        ? record.scan_time.slice(0, 10) === selectedClassDate
        : false;
    }
    const gradeMatch =
      selectedGrade !== "all"
        ? String(record.grade) === String(selectedGrade)
        : true;
    const statusMatch =
      selectedStatus !== "all"
        ? String(record.status).toLowerCase() === selectedStatus.toLowerCase()
        : true;
    return classDateMatch && gradeMatch && statusMatch;
  });

  return (
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
      
      {isAttendanceVisible && <EditAttendance userData={userData}  setIsAttendanceVisible={setIsAttendanceVisible}/>}
      <DataTable
        columns={attendanceColumns}
        rows={filteredAttendance}
        activeTab={activeTab}
        setIsAttendanceVisible={setIsAttendanceVisible}
        setUserData={setUserData}
      />
    </div>
  );
};

export default AttendanceManagement;

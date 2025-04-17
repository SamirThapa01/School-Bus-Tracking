import React, { useState, useEffect } from "react";
import axios from "axios";
import SidebarAdmin from "./SidebarAdmin";
import Dashboard from "./Dashboard";
import StudentManagement from "./StudentManagement";
import BusManagement from "./BusManagement";
import AttendanceManagement from "./AttendanceManagement";
import "./Signup.css";

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [isCreateUserVisible, setIsCreateUserVisible] = useState(false);
  const [isEditUserVisible, setIsEditUserVisible] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState("all");
  const [students, setStudents] = useState([]);
  const [isAttendanceVisible, setIsAttendanceVisible] = useState(false);
  const [buses, setBuses] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [parents, setParents] = useState([]);
  const [others, setOthers] = useState([]);
  const [selectedClassDate, setSelectedClassDate] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [isCreateBusVisible, setIsCreateBusVisible] = useState(false);
  const [busData, setBusData] = useState({});
  const [profileMode, setProfileMode] = useState("create");

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (activeTab === "students") {
          const studentResponse = await axios.get(
            "http://localhost:8000/react/get/Allstudents"
          );
          setStudents(studentResponse.data.students);
        } else if (activeTab === "buses") {
          const busResponse = await axios.get(
            "http://localhost:8000/react/admin/getAllBus"
          );
          setBuses(busResponse.data.buses);
        } else if (activeTab === "attendance") {
          const attendanceResponse = await axios.get(
            "http://localhost:8000/react/admin/attendance"
          );
          setAttendance(attendanceResponse.data.data);
        } else if (activeTab === "parents") {
          const parentResponse = await axios.get(
            "http://localhost:8000/react/get/AllParents"
          );
          setParents(parentResponse.data.parents);
        } else if (activeTab === "others") {
          const otherResponse = await axios.get(
            "http://localhost:8000/react/get/AllOthers"
          );
          setOthers(otherResponse.data.others);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [activeTab]);

  return (
    <div className="admin-container">
      <SidebarAdmin activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="content">
        {activeTab === "home" && (
          <Dashboard
            activeTab={activeTab}
            students={students}
            buses={buses}
            parents={parents}
            others={others}
          />
        )}
        {activeTab === "students" && (
          <StudentManagement
            activeTab={activeTab}
            students={students}
            isCreateUserVisible={isCreateUserVisible}
            setIsCreateUserVisible={setIsCreateUserVisible}
            isEditUserVisible={isEditUserVisible}
            setIsEditUserVisible={setIsEditUserVisible}
            selectedGrade={selectedGrade}
            setSelectedGrade={setSelectedGrade}
          />
        )}
       
        {activeTab === "buses" && <BusManagement buses={buses} setIsCreateBusVisible={setIsCreateBusVisible}  isCreateBusVisible={isCreateBusVisible} activeTab={activeTab} setBusData = {setBusData} setProfileMode = {setProfileMode} profileMode = {profileMode} busData={busData}/>}
        {activeTab === "attendance" && (
          <AttendanceManagement
            activeTab={activeTab}
            attendance={attendance}
            selectedClassDate={selectedClassDate}
            setSelectedClassDate={setSelectedClassDate}
            selectedStatus={selectedStatus}
            setSelectedStatus={setSelectedStatus}
            selectedGrade={selectedGrade}
            setSelectedGrade={setSelectedGrade}
            isAttendanceVisible={isAttendanceVisible}
            setIsAttendanceVisible={setIsAttendanceVisible}
          />
        )}
      </main>
    </div>
  );
};

export default AdminPanel;

import React from "react";
import { Home, Bus, Users, School } from "lucide-react";

const SidebarAdmin = ({ activeTab, setActiveTab }) => {
  return (
    <aside className="sidebar">
      <h1>
        <School /> Bus Management
      </h1>
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
  );
};

export default SidebarAdmin;

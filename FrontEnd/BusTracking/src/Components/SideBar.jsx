import BusCard from "./BusCard";
const SideBar = ({ setActiveTab, activeTab,locationData }) => {
  const busData = [
    {
      id: "1",
      driver: "lalit kumar",
      location: "sankhu",
      students: "1/30",
      speed: "25km/hr",
    },
  ];

  return (
    <div className="sidebar">
      <div className="tabs">
        <button
          className={activeTab === "Live Tracking" ? "tab active" : "tab"}
          onClick={() => setActiveTab("Live Tracking")}
        >
          Live Tracking
        </button>
        <button
          className={activeTab === "Attendance" ? "tab active" : "tab"}
          onClick={() => setActiveTab("Attendance")}
        >
          Attendance
        </button>
      </div>

      <div className="search-container">
        <input
          type="text"
          className="search-input"
          placeholder="Search bus, route, or location..."
        />
      </div>

      <div>
        {busData.map((bus) => (
          <BusCard key={bus.id} bus={bus} locationData={locationData} />
        ))}
      </div>
    </div>
  );
};
export default SideBar;

import BusCard from "./BusCard";
const SideBar = () => {
    const busData = [
      {
        id: '1',
        status: 'Running',
        route: 'Mulpani-sunkhu',
        driver: 'lalit kumar',
        location: 'sankhu',
        students: '1/30',
        speed: '25km/hr'
      },
      
    ];
  
    return (
      <div className="sidebar">
        <div className="tabs">
          <button className="tab active">Live Tracking</button>
          <button className="tab">Attendance</button>
        </div>
        
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="Search bus, route, or location..."
          />
        </div>
        
        <div>
          {busData.map(bus => (
            <BusCard key={bus.id} bus={bus} />
          ))}
        </div>
      </div>
    );
}
export default SideBar
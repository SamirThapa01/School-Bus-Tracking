const Updates = ({ rfid }) => {
  return (
    <div className="alerts-section">
      <h4 className="alerts-title">Recent Updates</h4>

      {rfid ? (
        <div className="alert-item">
          <div className="alert-icon">🔑</div>
          <div className="alert-content">
            <div className="alert-title">Student no:</div>
            <div className="alert-location">{rfid}</div>
          </div>
        </div>
      ) : (
        <div className="alert-item">
          <div className="alert-icon">❌</div>
          <div className="alert-content">
            <div className="alert-title">No recent updates</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Updates;

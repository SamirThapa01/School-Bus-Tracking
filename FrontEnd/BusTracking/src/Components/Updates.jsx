import React, { useState, useEffect } from "react";
import { AlertCircle, MapPin, AlertTriangle, MessageCircle, Key } from "lucide-react";

const Updates = ({ rfid, emergencyAlerts = [] }) => {
  const getAlertIcon = (type) => {
    if (type === "Medical problem") return "🚑";
    if (type === "Problem in vehicle") return "🔧";
    if (type === "Accident alert") return "⚠️";
    if (type === "rfid") return "🔑";
    return "❗";
  };

  const getAlertColor = (type) => {
    if (type === "Medical problem") return "#ef4444";
    if (type === "Problem in vehicle") return "#f97316";
    if (type === "Accident alert") return "#eab308";
    if (type === "rfid") return "#0ea5e9";
    if (type === "message") return "#8b5cf6";
    return "#6b7280";
  };

 
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="alerts-section">
      <h4 className="alerts-title">Recent Updates</h4>

      {emergencyAlerts.length > 0 ? (
        <div className="alerts-list">
          {emergencyAlerts.map((alert, index) => (
            <div 
              key={index} 
              className="alert-item" 
              style={{ borderLeft: `4px solid ${getAlertColor(alert.type)}` }}
            >
              <div className="alert-icon">{getAlertIcon(alert.type)}</div>
              <div className="alert-content">
                <div className="alert-title">
                  {alert.type === "message" ? "Emergency Message" : alert.type}
                </div>
                {alert.message && (
                  <div className="alert-message">{alert.message}</div>
                )}
                <div className="alert-location">
                  {alert.location ? (
                    <>Lat: {alert.location.lat?.toFixed(4)}, Long: {alert.location.long?.toFixed(4)}</>
                  ) : (
                    "Location not available"
                  )}
                </div>
                <div className="alert-time">{formatTime(alert.timestamp)}</div>
              </div>
            </div>
          ))}
        </div>
      ) : rfid ? (
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

      <style jsx>{`
        .alerts-section {
          background-color: white;
          border-radius: 8px;
          padding: 16px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          max-height: 150px;
          overflow-y: auto;
        }
        
        .alerts-title {
          margin-top: 0;
          margin-bottom: 16px;
          font-size: 16px;
          font-weight: 600;
        }
        
        .alerts-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .alert-item {
          display: flex;
          padding: 12px;
          background-color: #f9fafb;
          border-radius: 6px;
          gap: 12px;
        }
        
        .alert-icon {
          font-size: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .alert-content {
          flex: 1;
        }
        
        .alert-title {
          font-weight: 600;
          margin-bottom: 4px;
        }
        
        .alert-message {
          margin-bottom: 4px;
          font-size: 14px;
        }
        
        .alert-location {
          font-size: 12px;
          color: #6b7280;
        }
        
        .alert-time {
          font-size: 12px;
          color: #6b7280;
          margin-top: 4px;
        }
      `}</style>
    </div>
  );
};

export default Updates;
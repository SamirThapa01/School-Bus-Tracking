import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import {
  AlertCircle,
  MapPin,
  Wifi,
  WifiOff,
  Shield,
  Power,
  PlayCircle,
  StopCircle,
  MessageCircle,
} from "lucide-react";
const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    fontFamily: "Arial, sans-serif",
    backgroundColor: "#f5f5f5",
    margin: 0,
    padding: 0,
  },
  header: {
    backgroundColor: "#2563eb",
    color: "white",
    padding: "16px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  headerContent: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: "20px",
    fontWeight: "bold",
    margin: 0,
  },
  connectionStatus: {
    display: "flex",
    alignItems: "center",
  },
  connectionText: {
    marginLeft: "8px",
    fontSize: "14px",
  },
  mainContent: {
    flex: "1",
    padding: "16px",
  },
  card: {
    backgroundColor: "white",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    padding: "16px",
    marginBottom: "24px",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    marginBottom: "16px",
  },
  cardTitle: {
    fontSize: "18px",
    fontWeight: "600",
    marginLeft: "8px",
    margin: 0,
  },
  locationGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "8px",
  },
  locationItem: {
    backgroundColor: "#f9fafb",
    padding: "12px",
    borderRadius: "4px",
  },
  locationItemFull: {
    backgroundColor: "#f9fafb",
    padding: "12px",
    borderRadius: "4px",
    gridColumn: "span 2",
  },
  locationLabel: {
    color: "#6b7280",
    fontSize: "14px",
    margin: "0 0 4px 0",
  },
  locationValue: {
    fontWeight: "500",
    margin: 0,
  },
  statusAlert: {
    padding: "12px",
    marginBottom: "24px",
    borderRadius: "8px",
    textAlign: "center",
    fontWeight: "500",
  },
  successAlert: {
    backgroundColor: "#d1fae5",
    color: "#047857",
  },
  errorAlert: {
    backgroundColor: "#fee2e2",
    color: "#b91c1c",
  },
  emergencyButtonsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "12px",
  },
  button: {
    padding: "12px 16px",
    borderRadius: "8px",
    border: "none",
    color: "white",
    fontWeight: "500",
    fontSize: "16px",
    cursor: "pointer",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    transition: "background-color 0.2s",
  },
  shareLocationButton: {
    backgroundColor: "#10b981",
    marginTop: "16px",
  },
  stopSharingButton: {
    backgroundColor: "#ef4444",
    marginTop: "16px",
  },
  buttonIcon: {
    marginRight: "8px",
  },
  medicalButton: {
    backgroundColor: "#dc2626",
  },
  mechanicalButton: {
    backgroundColor: "#f97316",
  },
  safetyButton: {
    backgroundColor: "#eab308",
  },
  policeButton: {
    backgroundColor: "#1d4ed8",
  },
  footer: {
    backgroundColor: "#1f2937",
    color: "white",
    padding: "16px",
    textAlign: "center",
    fontSize: "14px",
  },
  footerContent: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    marginLeft: "4px",
  },
  switchContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginTop: "8px",
  },
  switchText: {
    marginLeft: "8px",
    fontWeight: "500",
    fontSize: "14px",
  },
  messageInput: {
    width: "100%",
    padding: "12px",
    borderRadius: "4px",
    border: "1px solid #d1d5db",
    marginBottom: "12px",
    fontSize: "16px",
  },
  messageButton: {
    backgroundColor: "#2563eb",
    marginTop: "8px",
  },
  emergencyMessageCard: {
    marginBottom: "24px",
  },
  sentMessages: {
    backgroundColor: "#f0f9ff",
    padding: "12px",
    borderRadius: "4px",
    marginTop: "12px",
    maxHeight: "120px",
    overflowY: "auto",
  },
  messageItem: {
    padding: "8px 0",
    borderBottom: "1px solid #e5e7eb",
  },
  messageTime: {
    fontSize: "12px",
    color: "#6b7280",
    marginTop: "4px",
  },
};

const Driver = () => {
  const [location, setLocation] = useState({
    lat: null,
    long: null,
    accuracy: null,
  });
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [emergencyStatus, setEmergencyStatus] = useState(null);
  const [isSharing, setIsSharing] = useState(false);
  const [intervalId, setIntervalId] = useState(null);
  const [emergencyMessage, setEmergencyMessage] = useState("");
  const [sentMessages, setSentMessages] = useState([]);
  const [socketReconnectAttempts, setSocketReconnectAttempts] = useState(0);

  useEffect(() => {
    const socketConnection = io("http://192.168.1.73:8000", {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
    });

    // Socket event listeners
    socketConnection.on("connect", () => {
      console.log("Connected to Socket.IO server");
      setConnected(true);
      setSocketReconnectAttempts(0);
    });

    socketConnection.on("disconnect", () => {
      console.log("Disconnected from Socket.IO server");
      setConnected(false);
    });

    socketConnection.on("connect_error", (err) => {
      console.error("Connection error:", err);
      setConnected(false);
      setSocketReconnectAttempts((prev) => prev + 1);

      if (socketReconnectAttempts >= 5) {
        setEmergencyStatus(
          "Unable to connect to server. Please check your connection."
        );
        setTimeout(() => {
          setEmergencyStatus(null);
        }, 5000);
      }
    });

    socketConnection.on("emergencyReceived", (data) => {
      setEmergencyStatus(`${data.type} alert was received by server`);
      setTimeout(() => {
        setEmergencyStatus(null);
      }, 3000);
    });

    socketConnection.on("messageReceived", (data) => {
      setEmergencyStatus("Message received by server");
      setTimeout(() => {
        setEmergencyStatus(null);
      }, 3000);
    });

    setSocket(socketConnection);
    if (!navigator.geolocation) {
      console.error("Geolocation is not supported by this browser.");
      setEmergencyStatus("Geolocation not supported by this browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setLocation({
          lat: latitude,
          long: longitude,
          accuracy,
        });
      },
      (error) => {
        console.error("Geolocation error:", error);
        setEmergencyStatus("Error obtaining location");
      },
      { enableHighAccuracy: true, maximumAge: 0 }
    );

    // Cleanup: Disconnect the socket when component unmounts
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
      socketConnection.disconnect();
    };
  }, [socketReconnectAttempts]);

  // Function to start location sharing
  const startLocationSharing = () => {
    if (!navigator.geolocation) {
      setEmergencyStatus("Geolocation not supported");
      return;
    }

    // Clear any existing interval
    if (intervalId) {
      clearInterval(intervalId);
    }

    // Set up new interval for location sharing
    const newIntervalId = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          setLocation({
            lat: latitude,
            long: longitude,
            accuracy,
          });
          console.log("Sending location:", latitude, longitude);

          // Emit the location if socket is connected
          if (socket && socket.connected) {
            socket.emit("sendLocation", {
              lat: latitude,
              long: longitude,
              accuracy,
              timestamp: new Date().toISOString(),
            });
          } else {
            console.log("Socket not connected, location will not be sent.");
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
        },
        { enableHighAccuracy: true, maximumAge: 0 }
      );
    }, 5000);

    setIntervalId(newIntervalId);
    setIsSharing(true);
    setEmergencyStatus("Location sharing started");
    setTimeout(() => {
      setEmergencyStatus(null);
    }, 3000);
  };

  // Function to stop location sharing
  const stopLocationSharing = () => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
      setIsSharing(false);
      setEmergencyStatus("Location sharing stopped");

      // Clear status message after 3 seconds
      setTimeout(() => {
        setEmergencyStatus(null);
      }, 3000);
    }
  };

  const sendEmergencyAlert = (type) => {
    if (!socket) {
      setEmergencyStatus("Socket not initialized");
      setTimeout(() => setEmergencyStatus(null), 3000);
      return;
    }

    if (!connected) {
      setEmergencyStatus("Cannot send alert: Not connected");
      setTimeout(() => setEmergencyStatus(null), 3000);
      return;
    }

    if (!location.lat || !location.long) {
      setEmergencyStatus("Location not available");
      setTimeout(() => setEmergencyStatus(null), 3000);
      return;
    }

    const alertData = {
      type,
      location: {
        lat: location.lat,
        long: location.long,
        accuracy: location.accuracy,
      },
      timestamp: new Date().toISOString(),
    };

    // Use a Promise to handle emitting with acknowledgment
    new Promise((resolve, reject) => {
      socket.emit("emergencyAlert", alertData, (response) => {
        if (response && response.success) {
          resolve(response);
        } else {
          reject(new Error("Server did not responed"));
        }
      });

      // Set a timeout in case the server doesn't respond
      setTimeout(() => {
        reject(new Error("Server acknowledgment timeout"));
      }, 5000);
    })
      .then(() => {
        // Success handling
        setEmergencyStatus(`${type} alert sent`);

        // If not already sharing location, start sharing
        if (!isSharing) {
          startLocationSharing();
        }
      })
      .catch((error) => {
        console.error("Error sending emergency alert:", error);
        setEmergencyStatus(`Failed to send alert: ${error.message}`);
      })
      .finally(() => {
        // Clear the status message after 3 seconds
        setTimeout(() => {
          setEmergencyStatus(null);
        }, 3000);
      });
  };

  // Function to send custom emergency message
  const sendMessage = () => {
    if (!emergencyMessage.trim()) {
      setEmergencyStatus("Please enter a message");
      setTimeout(() => setEmergencyStatus(null), 3000);
      return;
    }

    if (!socket || !connected) {
      setEmergencyStatus("Cannot send message: Not connected");
      setTimeout(() => setEmergencyStatus(null), 3000);
      return;
    }

    const messageData = {
      message: emergencyMessage,
      location: {
        lat: location.lat,
        long: location.long,
        accuracy: location.accuracy,
      },
      timestamp: new Date().toISOString(),
    };

    // Use a Promise to handle emitting with acknowledgment
    new Promise((resolve, reject) => {
      socket.emit("emergencyMessage", messageData, (response) => {
        if (response && response.success) {
          resolve(response);
        } else {
          reject(new Error("Server did not acknowledge"));
        }
      });

      // Set a timeout in case the server doesn't respond
      setTimeout(() => {
        reject(new Error("Server acknowledgment timeout"));
      }, 5000);
    })
      .then(() => {
        // Add the message to the sent messages history
        const newMessage = {
          text: emergencyMessage,
          timestamp: new Date().toISOString(),
        };
        setSentMessages((prevMessages) => [...prevMessages, newMessage]);

        // Clear the input field
        setEmergencyMessage("");

        // Show success status
        setEmergencyStatus("Message sent successfully");

        // If not already sharing location, start sharing
        if (!isSharing) {
          startLocationSharing();
        }
      })
      .catch((error) => {
        console.error("Error sending emergency message:", error);
        setEmergencyStatus(`Failed to send message: ${error.message}`);
      })
      .finally(() => {
        // Clear the status message after 3 seconds
        setTimeout(() => {
          setEmergencyStatus(null);
        }, 3000);
      });
  };

  // Format time for display
  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Retry connection function
  const retryConnection = () => {
    // Disconnect existing socket if any
    if (socket) {
      socket.disconnect();
    }

    // Reset reconnection attempts
    setSocketReconnectAttempts(0);

    // Socket will automatically attempt to reconnect when initialized in useEffect
    setEmergencyStatus("Attempting to reconnect...");
    setTimeout(() => {
      setEmergencyStatus(null);
    }, 3000);
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.title}>Driver Mode</h1>
          <div style={styles.connectionStatus}>
            {connected ? (
              <Wifi color="#86efac" size={20} />
            ) : (
              <WifiOff color="#fca5a5" size={20} />
            )}
            <span style={styles.connectionText}>
              {connected ? "Connected" : "Disconnected"}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        {/* Connection retry button when disconnected */}
        {!connected && (
          <div
            style={{
              ...styles.statusAlert,
              ...styles.errorAlert,
              marginBottom: "16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>Not connected to server</span>
            <button
              onClick={retryConnection}
              style={{
                ...styles.button,
                backgroundColor: "#3b82f6",
                padding: "6px 12px",
                fontSize: "14px",
              }}
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* Location Card */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <MapPin color="#2563eb" size={20} />
            <h2 style={styles.cardTitle}>Current Location</h2>
          </div>

          <div style={styles.locationGrid}>
            <div style={styles.locationItem}>
              <p style={styles.locationLabel}>Latitude</p>
              <p style={styles.locationValue}>
                {location.lat?.toFixed(6) || "Waiting..."}
              </p>
            </div>
            <div style={styles.locationItem}>
              <p style={styles.locationLabel}>Longitude</p>
              <p style={styles.locationValue}>
                {location.long?.toFixed(6) || "Waiting..."}
              </p>
            </div>
            <div style={styles.locationItemFull}>
              <p style={styles.locationLabel}>Accuracy</p>
              <p style={styles.locationValue}>
                {location.accuracy
                  ? `${location.accuracy.toFixed(1)} meters`
                  : "Waiting..."}
              </p>
            </div>
          </div>

          {/* Location Sharing Controls */}
          {!isSharing ? (
            <button
              onClick={startLocationSharing}
              style={{ ...styles.button, ...styles.shareLocationButton }}
              disabled={!connected}
            >
              <PlayCircle size={20} style={styles.buttonIcon} />
              Start Sharing Location
            </button>
          ) : (
            <button
              onClick={stopLocationSharing}
              style={{ ...styles.button, ...styles.stopSharingButton }}
            >
              <StopCircle size={20} style={styles.buttonIcon} />
              Stop Sharing Location
            </button>
          )}
        </div>

        {/* Status message */}
        {emergencyStatus && (
          <div
            style={{
              ...styles.statusAlert,
              ...(emergencyStatus.includes("Cannot") ||
              emergencyStatus.includes("Error") ||
              emergencyStatus.includes("not supported") ||
              emergencyStatus.includes("Failed") ||
              emergencyStatus.includes("Unable")
                ? styles.errorAlert
                : styles.successAlert),
            }}
          >
            {emergencyStatus}
          </div>
        )}

        {/* Emergency Message Card */}
        <div style={{ ...styles.card, ...styles.emergencyMessageCard }}>
          <div style={styles.cardHeader}>
            <MessageCircle color="#2563eb" size={20} />
            <h2 style={styles.cardTitle}>Emergency Message</h2>
          </div>

          <input
            type="text"
            value={emergencyMessage}
            onChange={(e) => setEmergencyMessage(e.target.value)}
            placeholder="Type your emergency message here..."
            style={styles.messageInput}
            disabled={!connected}
          />

          <button
            onClick={sendMessage}
            style={{ ...styles.button, ...styles.messageButton }}
            disabled={!connected || !emergencyMessage.trim()}
          >
            <MessageCircle size={20} style={styles.buttonIcon} />
            Send Emergency Message
          </button>

          {sentMessages.length > 0 && (
            <div style={styles.sentMessages}>
              <p style={styles.locationLabel}>Recent Messages:</p>
              {sentMessages.map((msg, index) => (
                <div key={index} style={styles.messageItem}>
                  <p style={styles.locationValue}>{msg.text}</p>
                  <p style={styles.messageTime}>
                    {formatMessageTime(msg.timestamp)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Emergency Buttons */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <AlertCircle color="#dc2626" size={20} />
            <h2 style={styles.cardTitle}>Emergency Options</h2>
          </div>

          <div style={styles.emergencyButtonsGrid}>
            <button
              onClick={() => sendEmergencyAlert("Medical problem")}
              style={{ ...styles.button, ...styles.medicalButton }}
              disabled={!connected}
            >
              Medical Emergency
            </button>

            <button
              onClick={() => sendEmergencyAlert("Problem in vehicle")}
              style={{ ...styles.button, ...styles.mechanicalButton }}
              disabled={!connected}
            >
              Vehicle Breakdown
            </button>

            <button
              onClick={() => sendEmergencyAlert("Accident alert")}
              style={{ ...styles.button, ...styles.safetyButton }}
              disabled={!connected}
            >
              Accident
            </button>
          </div>
        </div>
      </div>

      <div style={styles.footer}>
        <div style={styles.footerContent}>
          <Shield size={16} />
          <p style={styles.footerText}>
            Location sharing: {isSharing ? "Active" : "Inactive"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Driver;

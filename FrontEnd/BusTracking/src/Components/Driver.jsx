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
  Loader,
} from "lucide-react";
import configFile from "../Config/ApiConfig";

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
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const socketConnection = io(`${configFile.socketioUrl}`, {
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

  // Styles with responsive design
  const styles = {
    container: {
      display: "flex",
      flexDirection: "column",
      minHeight: "100vh",
      fontFamily:
        "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
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
      maxWidth: "1200px",
      margin: "0 auto",
      width: "100%",
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
      padding: isMobileView ? "16px" : "32px",
      maxWidth: "1200px",
      margin: "0 auto",
      width: "100%",
    },
    dashboard: {
      display: isMobileView ? "block" : "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "24px",
    },
    leftColumn: {
      gridColumn: "1 / 2",
    },
    rightColumn: {
      gridColumn: "2 / 3",
    },
    fullWidth: {
      gridColumn: "1 / -1",
    },
    card: {
      backgroundColor: "white",
      borderRadius: "8px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
      padding: "20px",
      marginBottom: "24px",
      transition: "transform 0.2s, box-shadow 0.2s",
      border: "1px solid rgba(0,0,0,0.05)",
    },
    cardHover: {
      transform: "translateY(-2px)",
      boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
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
      color: "#1e293b",
    },
    locationGrid: {
      display: "grid",
      gridTemplateColumns: isMobileView ? "1fr 1fr" : "1fr 1fr 1fr",
      gap: "12px",
    },
    locationItem: {
      backgroundColor: "#f9fafb",
      padding: "12px",
      borderRadius: "6px",
      border: "1px solid #e5e7eb",
    },
    locationItemFull: {
      backgroundColor: "#f9fafb",
      padding: "12px",
      borderRadius: "6px",
      gridColumn: isMobileView ? "span 2" : "span 3",
      border: "1px solid #e5e7eb",
    },
    locationLabel: {
      color: "#6b7280",
      fontSize: "14px",
      margin: "0 0 4px 0",
    },
    locationValue: {
      fontWeight: "500",
      margin: 0,
      fontSize: "16px",
      color: "#1e293b",
    },
    statusAlert: {
      padding: "12px 16px",
      marginBottom: "24px",
      borderRadius: "8px",
      textAlign: "center",
      fontWeight: "500",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
      animation: "fadeIn 0.3s ease-in-out",
    },
    successAlert: {
      backgroundColor: "#d1fae5",
      color: "#047857",
      border: "1px solid #a7f3d0",
    },
    errorAlert: {
      backgroundColor: "#fee2e2",
      color: "#b91c1c",
      border: "1px solid #fecaca",
    },
    emergencyButtonsGrid: {
      display: isMobileView ? "grid" : "flex",
      gridTemplateColumns: "1fr",
      gap: "12px",
      justifyContent: "space-between",
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
      transition: "background-color 0.2s, transform 0.1s",
      flex: isMobileView ? "auto" : "1",
      margin: isMobileView ? "0" : "0 6px",
    },
    shareLocationButton: {
      backgroundColor: "#10b981",
      marginTop: "16px",
      "&:hover": {
        backgroundColor: "#059669",
      },
    },
    stopSharingButton: {
      backgroundColor: "#ef4444",
      marginTop: "16px",
      "&:hover": {
        backgroundColor: "#dc2626",
      },
    },
    buttonIcon: {
      marginRight: "8px",
    },
    medicalButton: {
      backgroundColor: "#dc2626",
      "&:hover": {
        backgroundColor: "#b91c1c",
      },
    },
    mechanicalButton: {
      backgroundColor: "#f97316",
      "&:hover": {
        backgroundColor: "#ea580c",
      },
    },
    safetyButton: {
      backgroundColor: "#eab308",
      "&:hover": {
        backgroundColor: "#ca8a04",
      },
    },
    footer: {
      backgroundColor: "#1e293b",
      color: "white",
      padding: "16px",
      textAlign: "center",
      fontSize: "14px",
    },
    footerContent: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      maxWidth: "1200px",
      margin: "0 auto",
    },
    footerText: {
      marginLeft: "4px",
    },
    messageInput: {
      width: "100%",
      padding: "12px",
      borderRadius: "6px",
      border: "1px solid #d1d5db",
      marginBottom: "12px",
      fontSize: "16px",
      outline: "none",
      transition: "border-color 0.2s",
      "&:focus": {
        borderColor: "#3b82f6",
        boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.2)",
      },
    },
    messageButton: {
      backgroundColor: "#2563eb",
      marginTop: "8px",
      width: "100%",
      "&:hover": {
        backgroundColor: "#1d4ed8",
      },
    },
    emergencyMessageCard: {
      marginBottom: "24px",
    },
    sentMessages: {
      backgroundColor: "#f0f9ff",
      padding: "12px",
      borderRadius: "6px",
      marginTop: "16px",
      maxHeight: isMobileView ? "120px" : "200px",
      overflowY: "auto",
      border: "1px solid #e0e7ff",
    },
    messageItem: {
      padding: "10px",
      borderRadius: "4px",
      marginBottom: "8px",
      backgroundColor: "#ffffff",
      border: "1px solid #e5e7eb",
    },
    messageTime: {
      fontSize: "12px",
      color: "#6b7280",
      marginTop: "4px",
    },
    retryButton: {
      backgroundColor: "#3b82f6",
      padding: "6px 12px",
      fontSize: "14px",
      borderRadius: "6px",
      marginLeft: "8px",
      "&:hover": {
        backgroundColor: "#2563eb",
      },
    },
    mapPlaceholder: {
      height: isMobileView ? "200px" : "300px",
      backgroundColor: "#e5e7eb",
      borderRadius: "6px",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "column",
      gap: "12px",
      color: "#6b7280",
    },
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
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
      </header>

      {/* Main Content */}
      <main style={styles.mainContent}>
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
            <div style={{ display: "flex", alignItems: "center" }}>
              <AlertCircle size={18} style={{ marginRight: "8px" }} />
              <span>Not connected to server</span>
            </div>
            <button
              onClick={retryConnection}
              style={{
                ...styles.button,
                ...styles.retryButton,
              }}
            >
              Retry Connection
            </button>
          </div>
        )}

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
            {emergencyStatus.includes("Cannot") ||
            emergencyStatus.includes("Error") ||
            emergencyStatus.includes("not supported") ||
            emergencyStatus.includes("Failed") ||
            emergencyStatus.includes("Unable") ? (
              <AlertCircle size={18} />
            ) : (
              <Shield size={18} />
            )}
            {emergencyStatus}
          </div>
        )}

        <div style={styles.dashboard}>
          {/* Left Column - Location & Map */}
          <div style={isMobileView ? {} : styles.leftColumn}>
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
                {!isMobileView && (
                  <div style={styles.locationItem}>
                    <p style={styles.locationLabel}>Accuracy</p>
                    <p style={styles.locationValue}>
                      {location.accuracy
                        ? `${location.accuracy.toFixed(1)} meters`
                        : "Waiting..."}
                    </p>
                  </div>
                )}
                {isMobileView && (
                  <div style={styles.locationItemFull}>
                    <p style={styles.locationLabel}>Accuracy</p>
                    <p style={styles.locationValue}>
                      {location.accuracy
                        ? `${location.accuracy.toFixed(1)} meters`
                        : "Waiting..."}
                    </p>
                  </div>
                )}
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

            {/* Emergency Buttons - Only shown on mobile or left column on desktop */}
            {isMobileView && (
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
            )}
          </div>

          {/* Right Column - Emergency Message & Buttons */}
          <div style={isMobileView ? {} : styles.rightColumn}>
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

            {/* Emergency Buttons - Only in right column on desktop */}
            {!isMobileView && (
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
            )}
          </div>
        </div>
      </main>

      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <Shield size={16} />
          <p style={styles.footerText}>
            Location sharing: {isSharing ? "Active" : "Inactive"}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Driver;

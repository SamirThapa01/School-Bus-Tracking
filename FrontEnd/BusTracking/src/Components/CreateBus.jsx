import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Signup.css";
import configFile from "../Config/ApiConfig";

const CreateBus = ({ setIsCreateBusVisible, profileMode, busData }) => {
  const [data, setData] = useState({
    busNumber: "",
    capacity: "",
    driver: "",
  });

  const [errors, setErrors] = useState({
    busNumber: "",
    capacity: "",
    driver: "",
  });

  useEffect(() => {
    if (profileMode === "edit" && busData) {
      setData({
        busNumber: busData.bus_number || "",
        capacity: busData.capacity || "",
        driver: busData.driver_name || "",
      });
    }
  }, [profileMode, busData]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setData({ ...data, [name]: value });

    if (name === "busNumber") {
      setErrors({
        ...errors,
        busNumber: value ? "" : "Bus number is required",
      });
    } else if (name === "capacity") {
      setErrors({
        ...errors,
        capacity:
          parseInt(value) > 0 ? "" : "Capacity must be a positive number",
      });
    } else if (name === "driver") {
      setErrors({ ...errors, driver: value ? "" : "Driver name is required" });
    }
  };

  const handleCreate = async () => {
    if (!data.busNumber || !data.capacity || !data.driver) {
      alert("Please fill in all fields");
      return;
    }

    try {
      let response;

      if (profileMode === "edit") {
        response = await axios.put(
          `${configFile.apiUrl}/react/admin/updateBus/${busData.bus_id}`,
          data,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.status === 200) {
          alert("Bus updated successfully");
          setIsCreateBusVisible(false);
        }
      } else {
        // Create new bus
        response = await axios.post(
          `${configFile.apiUrl}/react/admin/insertBus`,
          data,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.status === 201) {
          alert("Bus created successfully");
          setIsCreateBusVisible(false);
        }
      }
    } catch (error) {
      console.error(
        `Error ${profileMode === "edit" ? "updating" : "creating"} bus:`,
        error
      );
      alert(
        `An error occurred while ${
          profileMode === "edit" ? "updating" : "creating"
        } the bus. Please try again.`
      );
    }
  };

  return (
    <div className="user-details" style={{ margin: "0 calc(50% - 340px)" }}>
      {console.log(profileMode)}
      {console.log(busData)}
      <form>
        <div>
          <h2>{profileMode === "edit" ? "Edit Bus" : "Add Bus"}</h2>
        </div>
        <div className="form-group">
          <label htmlFor="busNumber">Bus Number:</label>
          <input
            type="text"
            id="busNumber"
            name="busNumber"
            value={data.busNumber}
            onChange={handleChange}
          />
          {errors.busNumber && (
            <p style={{ color: "red", fontSize: "14px" }}>{errors.busNumber}</p>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="capacity">Capacity:</label>
          <input
            type="number"
            id="capacity"
            name="capacity"
            value={data.capacity}
            onChange={handleChange}
          />
          {errors.capacity && (
            <p style={{ color: "red", fontSize: "14px" }}>{errors.capacity}</p>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="driver">Driver Name:</label>
          <input
            type="text"
            id="driver"
            name="driver"
            value={data.driver}
            onChange={handleChange}
          />
          {errors.driver && (
            <p style={{ color: "red", fontSize: "14px" }}>{errors.driver}</p>
          )}
        </div>

        <button type="button" onClick={handleCreate}>
          {profileMode === "edit" ? "Update" : "Create"}
        </button>
        <button
          type="button"
          onClick={() => {
            setIsCreateBusVisible(false);
          }}
        >
          Cancel
        </button>
      </form>
    </div>
  );
};

export default CreateBus;

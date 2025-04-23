import React, { act, useRef, useState } from "react";
import { Edit, Trash2 } from "lucide-react";
import Swal from "sweetalert2";
import Profile from "./Profile";
import axios from "axios";
import EditUser from "./EditUser";
import "./Signup.css";
import configFile from "../Config/ApiConfig";

function DataTable({
  columns,
  rows,
  isEditUserVisible,
  setIsEditUserVisible,
  setUserData,
  activeTab,
  setIsAttendanceVisible,
  setBusData,
  setProfileMode,
  setIsCreateBusVisible,
}) {
  const [selectedRow, setSelectedRow] = useState(null);

  const myRef = useRef(null);

  const handleDelete = async (row) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      if (activeTab === "students") {
        try {
          const response = await axios.delete(
            `${configFile.apiUrl}/react/admin/delete/${row.student_id}`
          );

          if (response.data.success) {
            await Swal.fire({
              title: "Deleted!",
              text: `${row.student_name}'s data has been deleted`,
              icon: "success",
            });
            window.location.reload();
          } else {
            Swal.fire({
              title: "Error",
              text: "Failed to delete the student.",
              icon: "error",
            });
          }
        } catch (error) {
          console.error("Error deleting student data:", error);
          Swal.fire({
            title: "Error",
            text: "There was an error deleting the student data.",
            icon: "error",
          });
        }
      } else if (activeTab === "buses") {
        console.log("Deleting bus with ID:", row.bus_id);
        try {
          const response = await axios.delete(
            `${configFile.apiUrl}/react/admin/deleteBus/${row.bus_id}`
          );

          if (response.data.success) {
            await Swal.fire({
              title: "Deleted!",
              text: `${row.bus_number}'s data has been deleted`,
              icon: "success",
            });
            window.location.reload();
          } else {
            Swal.fire({
              title: "Error",
              text: "Failed to delete the bus.",
              icon: "error",
            });
          }
        } catch (error) {
          console.error("Error deleting bus data:", error);
          Swal.fire({
            title: "Error",
            text: "There was an error deleting the bus data.",
            icon: "error",
          });
        }
      }
    }
  };

  const handleEdit = (row) => {
    console.log("Editing row:", row);
    if (activeTab === "attendance") {
      setIsAttendanceVisible(true);
      setUserData(row);
    } else if (activeTab === "buses") {
      setBusData(row);
      setProfileMode("edit");
      setIsCreateBusVisible(true);
    } else {
      setIsEditUserVisible(true);
      setUserData(row);
      setSelectedRow(row);
      setProfileMode("edit");
    }
  };

  const handleCloseProfile = () => {
    setSelectedRow(null);
    setProfileMode("view");
  };

  return (
    <div className="data-table-container">
      <table>
        <thead>
          <tr>
            {columns.map((col, index) => (
              <th key={index}>{col}</th>
            ))}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {Object.keys(row).map((key, colIndex) => (
                <td key={colIndex}>{row[key]}</td>
              ))}
              <td>
                <button className="edit" onClick={() => handleEdit(row)}>
                  <Edit />
                </button>
                {console.log(activeTab)}
                {activeTab !== "attendance" && (
                  <button className="delete" onClick={() => handleDelete(row)}>
                    <Trash2 />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;

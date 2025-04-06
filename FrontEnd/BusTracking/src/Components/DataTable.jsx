import React, { useState } from "react";
import { Edit, Trash2 } from "lucide-react";
import Swal from "sweetalert2";
import Profile from "./Profile";
import axios from "axios"; // Import axios for making API requests

function DataTable({ columns, rows }) {
  const [selectedRow, setSelectedRow] = useState(null);
  const [profileMode, setProfileMode] = useState("view");

  const handleDelete = (row) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axios.delete(
            `http://localhost:8000/react/admin/delete/${row.student_id}`
          );

          if (response.data.success) {
            Swal.fire({
              title: "Deleted!",
              text: `${row.student_name}'s data has been deleted`,
              icon: "success",
            }).then(() => {
              window.location.reload();
            
            });
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
      }
    });
  };

  const handleEdit = (row) => {
    setSelectedRow(row);
    setProfileMode("edit");
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
                <button className="delete" onClick={() => handleDelete(row)}>
                  <Trash2 />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedRow && (
        <div className="profile-overlay">
          <Profile
            mode={profileMode}
            initialData={selectedRow}
            onClose={handleCloseProfile}
          />
        </div>
      )}
    </div>
  );
}

export default DataTable;

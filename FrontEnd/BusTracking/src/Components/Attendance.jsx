import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Signup.css'; 
import configFile from '../Config/ApiConfig';

const Attendance = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [studentName, setStudentName] = useState('');
  const [grade, setGrade] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const response = await axios.get( `${configFile.apiUrl}/react/getStudent`, {
          withCredentials: true,
        }); 

        const data = response.data.studentData || [];
        setAttendanceData(data);
        if (data.length > 0) {
          setStudentName(data[0].student_name);
          setGrade(data[0].grade);
        }
      } catch (error) {
        console.error('Error fetching attendance:', error);
      }
    };

    fetchAttendance();
  }, []);
 console.log(attendanceData)
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = attendanceData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(attendanceData.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  const formatTime = (timestamp) => {
    if (!timestamp) return '-';
    const dateObj = new Date(timestamp);
    return dateObj.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="attendance-container">
     
      <div className="attendance-header-profile">
        <div className="attendance-header">{studentName}
        <br/><span className="profile-grade">Grade: {grade}</span>
        </div>
        
        <div className="attendance-profile">
          <img
            src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
            alt="Profile"
            className="profile-image"
          />
          
        </div>
      </div>

      {/* Table Headers */}
      <div className="attendance-table-header">
        <span>Date</span>
        <span>Arrival</span>
        <span>Departure</span>
        <span>Status</span>
        <span>Duration</span>
      </div>

      {/* Attendance Records */}
      {currentItems.map((entry, index) => {
        const date = new Date(entry.entry_time || entry.exit_time).toLocaleDateString('en-US', {
          month: 'short',
          day: '2-digit',
          year: 'numeric',
        });

        return (
          <div
            key={index}
            className={`attendance-row ${
              index === currentItems.length - 1 && currentPage === totalPages
                ? 'attendance-last-row'
                : ''
            }`}
          >
            <div className="attendance-date-section">{date}</div>
            <div className="attendance-status-section">
              <span>{formatTime(entry.entry_time)}</span>
              <span>{formatTime(entry.exit_time)}</span>
              <span className={`attendance-status-${entry.status?.toLowerCase() || 'absent'}`}>
                {entry.status || 'Absent'}
              </span>
              <span>{entry.total_time ? `${entry.total_time} min` : '-'}</span>
            </div>
          </div>
        );
      })}

      {/* Pagination */}
      <div className="attendance-pagination">
        <button
          onClick={prevPage}
          className={`attendance-page-button ${currentPage === 1 ? 'attendance-button-disabled' : ''}`}
          disabled={currentPage === 1}
        >
          Prev
        </button>

        {Array.from({ length: totalPages }).map((_, index) => (
          <button
            key={index}
            onClick={() => paginate(index + 1)}
            className={`attendance-page-button ${currentPage === index + 1 ? 'attendance-button-active' : ''}`}
          >
            {index + 1}
          </button>
        ))}

        <button
          onClick={nextPage}
          className={`attendance-page-button ${currentPage === totalPages ? 'attendance-button-disabled' : ''}`}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Attendance;

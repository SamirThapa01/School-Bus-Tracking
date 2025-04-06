import React from 'react';
import { Mail, Phone, Bus, Car as IdCard, GraduationCap, Calendar, Users } from 'lucide-react';

function UserProfile() {
    const student = {
        name: "John Doe",
        id: "12345",
        grade: "10th Grade",
        age: 16,
        parentEmail: "johndoe@parentmail.com",
        contactNumber: "+1-555-123-4567",
        busId: "bus-9876",
        busNumber: "45",
        profileImage: "data:image/jpeg;base64,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" // You can replace this URL with an actual image URL.
      };
      
  return (
    <div className="student-profile">
      <div className="profile-card">
        <div className="profile-header"></div>
        
        <div className="profile-body">
          <div className="profile-image-container">
            <img
              src={student.profileImage || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&h=200"}
              alt={student.name}
              className="profile-image"
            />
            <h1 className="profile-name">{student.name}</h1>
            <p className="profile-id">
              <IdCard size={16} className="icon" />
              Student ID: {student.id}
            </p>
          </div>

          <div className="profile-info">
            <div className="info-item">
              <GraduationCap className="icon" />
              <div>
                <p className="info-label">Grade</p>
                <p className="info-value">{student.grade}</p>
              </div>
            </div>

            <div className="info-item">
              <Calendar className="icon" />
              <div>
                <p className="info-label">Age</p>
                <p className="info-value">{student.age} years</p>
              </div>
            </div>

            <div className="info-item">
              <Bus className="icon" />
              <div>
                <p className="info-label">Bus Details</p>
                <p className="info-value">Bus #{student.busNumber} (ID: {student.busId})</p>
              </div>
            </div>

            <div className="info-item">
              <Users className="icon" />
              <div>
                <p className="info-label">Parent Contact</p>
                <div className="contact-info">
                  <div className="contact-item">
                    <Mail size={14} className="icon" />
                    <a href={`mailto:${student.parentEmail}`} className="contact-link">
                      {student.parentEmail}
                    </a>
                  </div>
                  <div className="contact-item">
                    <Phone size={14} className="icon" />
                    <a href={`tel:${student.contactNumber}`} className="contact-link">
                      {student.contactNumber}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;

import dbConnector from "../Routes/connection.js";
import otpGenerator from 'otp-generator'
import rfidMail from "../rfidMail.js";
import mailSender from "../mailSender.js";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';
import dotenv from "dotenv";
import EmergencyMail from "../EmergencyMail.js";
import geolib from 'geolib';
import checkGeofence from "../CheckGeofence.js";
dotenv.config();
const db = new dbConnector();
const otpData = {};


class UserController {
  async getUserData(req , res){
    const query = 'SELECT * FROM users';
    try {
      const [result] = await db.connection.promise().query(query);
      if (result.length <= 0) {
        res.status(400).json({ success: false, message: "User not found" });
      } else {
        res.status(200).json(result);
      }
    } catch (err) {
      console.error("Error retrieving data from the database:", err);
      res.status(500).send("Error retrieving data from the database");
    }
  }
  
  async addUser(req, res) {
    try {
      const { email, phoneNumber, password } = req.body;
      console.log(email);
  
      if (!email || !phoneNumber || !password) {
        return res.status(400).json({ success: false, message: "All fields are required" });
      }
  
      const [result] = await db.connection.promise().query(
        "SELECT * FROM parent WHERE email = ?",
        [email]
      );
  
      if (result.length > 0) {
        return res.status(400).json({ success: false, message: "User already exists" });
      }
  
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
  
      // Insert user with default role 'user'
      await db.connection.promise().query(
        "INSERT INTO parent (email, contact_number, password, is_student_linked, student_id, role) VALUES (?, ?, ?, ?, ?, ?)",
        [email, phoneNumber, hashedPassword, 0, null, 'user']
      );
  
      const token = jwt.sign({ email, role: 'user' }, process.env.SecretKey);
  
      res.cookie("token", token, { httpOnly: true, sameSite: 'strict' });
  
      return res.status(201).json({ success: true, message: "User registered successfully", token });
    } catch (error) {
      console.error("Error:", error);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  }
  
  
  async updateStudentDetails(req, res) {
    try {
      const { student_id } = req.params;
      const { name, age, grade, rfid, contact, email } = req.body;
      if (!student_id || !name || !age || !grade || !rfid || !contact || !email) {
        return res.status(400).json({ message: 'All fields are required' });
      }
  
      const updateStudentQuery = `
        UPDATE Student
        SET name = ?, age = ?, grade = ?
        WHERE student_id = ?;
      `;
      await db.connection.promise().query(updateStudentQuery, [name, age, grade, student_id]);
  
      const updateRFIDQuery = `
        UPDATE rfid_card
        SET rfid_tag_id = ?
        WHERE student_id = ?;
      `;
      await db.connection.promise().query(updateRFIDQuery, [rfid, student_id]);
  
      const updateParentQuery = `
        UPDATE Parent
        SET contact_number = ?, email = ?
        WHERE student_id = ?;
      `;
      await db.connection.promise().query(updateParentQuery, [contact, email, student_id]);
  
      res.status(200).json({ message: 'Student details updated successfully' });
    } catch (error) {
      console.error("Error updating student:", error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
  
  async adminFillStudent(req, res) {
    try {
      const { name, age, grade, rfid, password, contact, email } = req.body;
  
      if (!name || !age || !grade || !rfid || !password || !contact || !email) {
        return res.status(400).json({ message: 'All fields are required' });
      }
  
      const [existingParent] = await db.connection.promise().query('SELECT * FROM Parent WHERE email = ?', [email]);
  
      if (existingParent.length > 0) {
        return res.status(400).json({ message: 'Parent with this email already exists' });
      }
  
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
  
      // Insert parent data into the Parent table with role as 'user'
      const parentInsertQuery = `
        INSERT INTO Parent (email, contact_number, password, role)
        VALUES (?, ?, ?, ?);
      `;
      const [parentInsertResult] = await db.connection.promise().query(parentInsertQuery, [email, contact, hashedPassword, 'user']); // Set default role 'user'
  
      // Get parent_id from the inserted parent record
      const parentId = parentInsertResult.insertId;
  
      // Insert student data into the Student table
      const studentQuery = `
        INSERT INTO Student (name, age, grade)
        VALUES (?, ?, ?);
      `;
      const [studentResult] = await db.connection.promise().query(studentQuery, [name, age, grade]);
  
      // Get student_id from the inserted student record
      const studentId = studentResult.insertId;
  
      // Insert RFID tag into the rfid_card table and link it with the student
      const rfidQuery = `
        INSERT INTO rfid_card (rfid_tag_id, student_id)
        VALUES (?, ?);
      `;
      const [rfidResult] = await db.connection.promise().query(rfidQuery, [rfid, studentId]);
  
      // Check if RFID tag was successfully inserted
      if (rfidResult.affectedRows === 0) {
        return res.status(500).json({ message: 'Error adding RFID tag' });
      }
  
      // Update the Parent table to link parent and student by setting student_id
      const updateParentQuery = `
        UPDATE Parent
        SET student_id = ?
        WHERE parent_id = ?;
      `;
      const [parentUpdateResult] = await db.connection.promise().query(updateParentQuery, [studentId, parentId]);
  
      // Check if the parent record was successfully updated
      if (parentUpdateResult.affectedRows === 0) {
        return res.status(500).json({ message: 'Error updating parent record with student ID' });
      }
  
      res.status(201).json({ message: 'Student data added, RFID tag inserted, and parent record updated successfully' });
    } catch (error) {
      console.error("Error adding student:", error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
  


  async deleteBus(req, res) {
    try {
      const { bus_id } = req.params;
      console.log(bus_id);
  
      const deleteQuery = "DELETE FROM Bus WHERE bus_id = ?";
      const [result] = await db.connection.promise().query(deleteQuery, [bus_id]);
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ success:false, message: "Bus not found" });
      }
  
      res.status(200).json({ success:true, message: "Bus deleted successfully" });
    } catch (error) {
      console.error("Error deleting bus:", error);
      res.status(500).json({ success:false, message: "Internal Server Error" });
    }
  }
  
  async insertBus(req, res) {
    try {
      const { busNumber, driver, capacity } = req.body;
      console.log(busNumber, driver, capacity);
  
      if (!busNumber || !driver || !capacity) {
        return res.status(400).json({ message: "All fields are required" });
      }
  
      const insertQuery = `
        INSERT INTO Bus (bus_number, driver_name, capacity)
        VALUES (?, ?, ?)
      `;
  
      await db.connection.promise().query(insertQuery, [busNumber, driver, capacity]);
      res.status(201).json({ message: "Bus inserted successfully" });
  
    } catch (error) {
      console.error("Error inserting bus:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
  

 
    async getAttendance(req, res) {
      const query = `
        SELECT 
          a.attendance_id, 
          a.student_id, 
          a.status, 
          a.scan_time AS date,
          s.name AS student_name, 
          s.grade
        FROM Attendance a
        JOIN Student s ON a.student_id = s.student_id
        ORDER BY a.scan_time DESC;
      `;
      
      try {
        const [attendanceData] = await db.promisePool.query(query);
        if (Array.isArray(attendanceData)) {
          res.json({ data: attendanceData });
        } else {
          res.status(404).send("No attendance data found");
        }
      } catch (error) {
        console.error("Error fetching attendance data:", error);
        res.status(500).send("Error fetching attendance data");
      }
    }

  
    async getStudentAttendance(req, res) {
      if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
    
      const email = req.user.email;
    
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }
    
      try {
        const query = `
          SELECT 
            s.name AS student_name,
            s.grade,
            a.entry_time,
            a.exit_time,
            a.total_time,
            a.status
          FROM parent p
          JOIN student s ON p.student_id = s.student_id
          LEFT JOIN attendance a ON s.student_id = a.student_id
          WHERE p.email = ?
          ORDER BY a.entry_time DESC;`;
    
        const [rows] = await db.connection.promise().query(query, [email]);
    
        if (rows.length === 0) {
          return res.status(404).json({ error: 'No student data found for this email' });
        }
    
        res.status(200).json({ studentData: rows });
      } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
    
    
  
async deleteStudents(req, res){
  const { student_id } = req.params;
  let connection;

  try {
    // Use db.promisePool to interact with the database
    connection = await db.promisePool.getConnection();

    // Start a transaction
    await connection.beginTransaction();

    // Deleting the RFID card associated with the student
    const [rfidResult] = await connection.query("DELETE FROM rfid_card WHERE student_id = ?", [student_id]);
    console.log('rfid_card deletion result:', rfidResult);

    // Deleting the Parent record associated with the student
    const [parentResult] = await connection.query("DELETE FROM Parent WHERE student_id = ?", [student_id]);
    console.log('Parent deletion result:', parentResult);

    // Deleting the Student record
    const [studentResult] = await connection.query("DELETE FROM Student WHERE student_id = ?", [student_id]);
    console.log('Student deletion result:', studentResult);

    // Commit the transaction
    await connection.commit();

    // Check if any rows were affected and respond
    if (rfidResult.affectedRows === 0 && parentResult.affectedRows === 0 && studentResult.affectedRows === 0) {
      console.log('No records were deleted');
      return res.status(404).json({ success: false, message: "Student not found or already deleted" });
    }

    res.status(200).json({ success: true, message: "Student data deleted successfully" });
  } catch (error) {
    console.error("Error deleting student:", error);

    // Rollback the transaction in case of an error
    if (connection) {
      await connection.rollback();
    }

    res.status(500).json({ success: false, message: "Internal Server Error" });
  } finally {
    // Always release the connection back to the pool
    if (connection) {
      connection.release();
    }
  }
}

  
async handelLogin(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Fields are required" });
    }

    const [result] = await db.connection.promise().query(
      "SELECT * FROM parent WHERE email = ?",
      [email]
    );

    if (result.length === 0) {
      return res.status(400).json({ success: false, message: "User not found" });
    }

    const user = result[0];

    // Check if password matches
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ success: false, message: "Password is not correct" });
    }

    const token = jwt.sign(
      { email, role: user.role }, 
      process.env.SecretKey
    );

    console.log('Created token:', token)
    res.cookie("token", token, { httpOnly: true, sameSite: 'strict' });

    return res.status(200).json({ success: true, message: "User logged in successfully" });
  } catch (err) {
    console.error("Error logging in user:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}


  async checkAuth(req,res){
    try{
      res.status(200).json({
        success:true,
        user : req.user
      })

    } catch(err){
      return res.status(500).json({success:false,message:"internal server error"})
    }
  }

  async verifyToken(req,res,next){
    try{
      const token = req.cookies.token;
      if(!token){
        return res.status(400).json({success:false , message:'not authorized token missing'})
      }
        const verify = jwt.verify(token,process.env.SecretKey);
        const [result] = await db.connection.promise().query("SELECT * FROM parent where email = ?",[verify.email]);
        if(result.length === 0){
          return res.status(400).json({success:false,message:"user doesnot exists"});
        }
         req.user = result[0];
         next();
      } catch(err){
        return res.status(400).json({success:false,message:'invalid token'})
      }
  }

  async logout(req, res){
      res.clearCookie("token",{ httpOnly: true, sameSite: 'strict'});
      res.status(200).json({success:true,message:'user logged out'});
  }
  async getUsers(req, res) {
    const { id } = req.params;
    if (id) {
      const query = "SELECT * FROM users WHERE id=?";
      try {
        const [result] = await db.connection.promise().query(query, [id]);
        if (result.length <= 0) {
          res.status(400).json({ success: false, message: "User not found" });
        } else {
          res.status(200).json(result);
        }
      } catch (err) {
        console.error("Error retrieving data from the database:", err);
        res.status(500).send("Error retrieving data from the database");
      }
    } else {
      res.status(400).send("ID is required");
    }
  }

  async updateUser(req, res) {
    const { id } = req.params;
    if (id) {
      const { lastname, firstname, address, city } = req.body;
      console.log(lastname, firstname, address, city);
      const query =
        "UPDATE users SET LastName = ?, FirstName = ?, Address = ?, City =? WHERE PersonID = ?";
      try {
        const [results] = await db.connection
          .promise()
          .query(query, [lastname, firstname, address, city, id]);
        res
          .status(200)
          .json({ success: true, message: "Fields updated successfully" });
      } catch (err) {
        console.log("Cannot update the fields: ", err);
        res.status(500).json({
          success: false,
          message: "Cannot update fields in database",
        });
      }
    } else {
      res.status(400).json({ success: false, message: "ID is required" });
    }
  }

  async deleteUser(req, res) {
    const { id } = req.params;
    if (id) {
      const query = "DELETE FROM users WHERE id = ?";
      try {
        const [result] = await db.connection.promise().query(query, [id]);
        res
          .status(200)
          .json({ success: true, message: "Deleted successfully" });
      } catch (err) {
        console.log(err);
        res.status(400).json({ success: false, message: "Failed to delete" });
      }
    } else {
      res.status(400).json({ success: false, message: "ID is required" });
    }
  }

  async  handelRfid(req, res) {
    const io = req.io;
    const { rfid, bus_id } = req.body;
    console.log("From rfid",rfid, bus_id);
    if (!rfid || !bus_id) {
        return res.status(400).json({ error: 'Invalid RFID data or Bus ID' });
    }

    console.log(`Received RFID data: ${rfid}, Bus ID: ${bus_id}`);

    try {
      
        const query = `
            SELECT 
                s.student_id,
                s.name AS student_name, 
                p.email, 
                p.contact_number,
                a.attendance_id, 
                a.entry_time,
                a.exit_time,
                a.status
            FROM rfid_card r
            LEFT JOIN student s ON r.student_id = s.student_id
            LEFT JOIN parent p ON s.student_id = p.student_id
            LEFT JOIN attendance a ON s.student_id = a.student_id AND a.bus_id = ?
            WHERE r.rfid_tag_id = ?
            ORDER BY a.scan_time DESC LIMIT 1`;

        const [rows] = await db.connection.promise().query(query, [bus_id, rfid]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'RFID not linked to any student' });
        }

        const { student_id, student_name, email, contact_number, attendance_id, entry_time, exit_time, status } = rows[0];
        const scan_time = new Date();
        const currentDate = new Date();

        let isNewDay = true;
        if (entry_time) {
            const entryDate = new Date(entry_time);
            isNewDay = 
                entryDate.getDate() !== currentDate.getDate() || 
                entryDate.getMonth() !== currentDate.getMonth() || 
                entryDate.getFullYear() !== currentDate.getFullYear();
        }

        
        if (isNewDay) {
            const insertQuery = `
                INSERT INTO attendance (student_id, bus_id, entry_time, scan_time, status)
                VALUES (?, ?, ?, ?, 'Entry Recorded')`;

            const [result] = await db.connection.promise().query(insertQuery, [student_id, bus_id, scan_time, scan_time]);

            rfidMail(email, student_name, scan_time, "Entry Recorded");

            return res.status(200).json({
                message: 'First scan recorded successfully for today.',
                student_name,
                email,
                contact_number,
                scan_time,
                status: 'Entry Recorded'
            });
        }

    
        if (status === "Present" || (entry_time && exit_time)) {
            return res.status(200).json({
                message: 'Attendance is already recorded completely. No changes made.',
                student_name,
                email,
                contact_number,
                scan_time,
                status: 'Present'
            });
        }

        
        if (entry_time && !exit_time) {
            const timeDifferenceInMinutes = Math.floor((scan_time - new Date(entry_time)) / 60000);

            if (timeDifferenceInMinutes >= 2 && timeDifferenceInMinutes <= 60) {
                const total_time = timeDifferenceInMinutes;

                const updateQuery = `
                    UPDATE attendance
                    SET exit_time = ?, status = 'Present', total_time = ?
                    WHERE attendance_id = ?`;

                await db.connection.promise().query(updateQuery, [scan_time, total_time, attendance_id]);

               
                rfidMail(email, student_name, scan_time, "Present");

               
                io.emit('rfidData', { 
                    rfid, 
                    student_name, 
                    email, 
                    contact_number, 
                    scan_time,
                    status: 'Present' 
                });

                return res.status(200).json({
                    message: 'Second scan recorded successfully, student marked present.',
                    student_name,
                    email,
                    contact_number,
                    scan_time,
                    status: 'Present'
                });
            } else if (timeDifferenceInMinutes < 20) {
                return res.status(200).json({
                    message: 'Second scan too early. Please scan again after 20 minutes from entry.',
                    student_name,
                    email,
                    contact_number,
                    status: 'Entry Recorded'
                });
            } else {
                return res.status(200).json({
                    message: 'Second scan too late. Valid window is 20-60 minutes after entry.',
                    student_name,
                    email,
                    contact_number,
                    status: 'Entry Recorded'
                });
            }
        }
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
async handelGps(req, res) {
  const io = req.io;
  const { latitude, longitude } = req.body;
  console.log("From handel gps",latitude, longitude);
  console.log("Received GPS data (POST):", req.body);

  const isInsideCircle = checkGeofence(latitude, longitude);

  if (latitude !== undefined && longitude !== undefined) {
    const latestGPSData = {
      latitude,
      longitude,
      timestamp: new Date()
    };

    io.emit('gpsData', latestGPSData);

    if (!isInsideCircle) {
      const alert = `Alert: The bus is outside the geofence at location (Lat: ${latitude}, Long: ${longitude})`;

      try {
        const [rows] = await db.connection.promise().query(`
          SELECT email FROM parent
        `);

        rows.forEach(row => {
          EmergencyMail(row.email, alert);
        });

      } catch (error) {
        console.error("Error sending geofence alert emails:", error);
      }
    }

    res.status(200).json({ message: 'GPS data received and processed.' });
  } else {
    res.status(400).json({ error: 'Invalid GPS data.' });
  }
}



  async checkOpt(req,res){
      const {email ,otp} = req.body;

      if(!otpData.hasOwnProperty(email)){
        return res.status(400).json({success:false ,message:"email not found"});
      } 

      if(otpData[email] === otp.trim()){
        delete otpData[email];
        console.log(otpData)
        return res.status(200).json({success:true , message:"Otp verified successfully"})
        
      }
      else{
        return res.status(400).json({success:false , message:"Invalid otp"});
      }
  }

  async profileData(req, res) {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
  
    try {
      const email = req.user.email;
      console.log(email);
  
      const parentSql = `
        SELECT 
          p.parent_id,
          p.contact_number,
          p.email,
          s.student_id
        FROM 
          Parent p
        LEFT JOIN 
          Student s ON s.student_id = p.student_id
        WHERE 
          p.email = ?;
      `;
  
      const [parentResult] = await db.connection.promise().query(parentSql, [email]);
      console.log(parentResult);
  
      // If no parent data is found
      if (parentResult.length === 0) {
        return res.status(404).json({ message: 'No parent data found for this email' });
      }
  
      const parentData = parentResult[0];
  
      // Check if student_id is null or empty (i.e., student data is missing)
      if (!parentData.student_id) {
        return res.status(200).json({ message: 'Student data is missing. Please fill in student details.' , success:false});
      }
  
      // If student data exists, fetch detailed student and parent data
      const sql = `
        SELECT 
          s.student_id,
          s.name AS student_name,
          s.age,
          s.grade,
          p.parent_id,
          p.contact_number,
          p.email,
          r.rfid_tag_id
        FROM 
          Student s
        LEFT JOIN 
          Parent p ON s.student_id = p.student_id
        LEFT JOIN 
          rfid_card r ON s.student_id = r.student_id
        WHERE 
          s.student_id = ?;
      `;
  
      const [studentResult] = await db.connection.promise().query(sql, [parentData.student_id]);
      if (studentResult.length === 0) {
        return res.status(404).json({ message: 'No student data found for this parent' });
      }
  
      const studentData = studentResult[0];
      res.json(studentData);
    } catch (error) {
      console.error("Error fetching profile data:", error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  async fillStudent(req, res) {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    try {
      const email = req.user.email; 
      console.log(email);
      console.log(req.body)
  
      // Extract student details from the request body
      const { studentName, studentAge, studentGrade, studentRfidTag } = req.body;
  
      // Validate that the student details and RFID tag are provided
      if (!studentName || !studentGrade || !studentAge || !studentRfidTag) {
        return res.status(400).json({ message: 'All student fields (name, age, grade, RFID tag) are required' });
      }
  
      // Query to fetch parent_id using the parent's email
      const parentQuery = `
        SELECT parent_id FROM Parent WHERE email = ?;
      `;
      const [parentResult] = await db.connection.promise().query(parentQuery, [email]);
  
      // If parent is not found, return an error
      if (parentResult.length === 0) {
        return res.status(404).json({ message: 'Parent not found' });
      }
  
      const parentId = parentResult[0].parent_id; 
  
      // SQL query to insert the new student into the Student table
      const studentQuery = `
        INSERT INTO Student (name, age, grade)
        VALUES (?, ?, ?);
      `;
      
      // Execute the query to insert student data
      const [studentResult] = await db.connection.promise().query(studentQuery, [studentName, studentAge, studentGrade]);
  
      // Check if the student was successfully inserted
      if (studentResult.affectedRows === 0) {
        return res.status(500).json({ message: 'Error adding student data' });
      }
  
      // Get the new student_id from the inserted row
      const studentId = studentResult.insertId;
  
      // Insert RFID tag into the rfid_card table
      const rfidQuery = `
        INSERT INTO rfid_card (rfid_tag_id, student_id)
        VALUES (?, ?);
      `;
      const [rfidResult] = await db.connection.promise().query(rfidQuery, [studentRfidTag, studentId]);
  
      // Check if the RFID tag was successfully inserted
      if (rfidResult.affectedRows === 0) {
        return res.status(500).json({ message: 'Error adding RFID tag' });
      }
  
      // Update the Parent table with the student_id
      const updateParentSql = `
        UPDATE Parent 
        SET student_id = ?
        WHERE parent_id = ?;
      `;
      const [updateParentResult] = await db.connection.promise().query(updateParentSql, [studentId, parentId]);
  
      // Check if the parent record was successfully updated
      if (updateParentResult.affectedRows === 0) {
        return res.status(500).json({ message: 'Error updating parent record with student ID' });
      }
  
      // Respond with a success message
      res.status(201).json({ message: 'Student data added, RFID tag inserted, and parent record updated successfully' });
    } catch (error) {
      console.error("Error adding student:", error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
  
  async updateUserProfile(req, res) {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

  
    try {
      const studentId = req.body.studentId; 
      const {
        parentId,
        parentPhone,
        email,
        name,
        grade,
        rfid,
        age
      } = req.body;
  
      // Ensure studentId is provided
      if (!studentId) {
        return res.status(400).json({ message: 'Student ID is required' });
      }
  
      // Ensure rfid_tag_id is valid (not null or empty)
      if (!rfid || rfid.trim() === "") {
        return res.status(400).json({ message: 'RFID Tag ID is required' });
      }
  
      // SQL query to update the student, parent, and RFID tag information
      const sql = `
        UPDATE 
          Student s
        LEFT JOIN 
          Parent p ON s.student_id = p.student_id
        LEFT JOIN 
          rfid_card r ON s.student_id = r.student_id
        SET
          s.name = ?, 
          s.age = ?, 
          s.grade = ?, 
          p.contact_number = ?, 
          p.email = ?, 
          r.rfid_tag_id = ?
        WHERE 
          s.student_id = ? AND p.parent_id = ?;
      `;
  

      const result = await db.connection.promise().query(sql, [
        name,
        age,
        grade,
        parentPhone,
        email,
        rfid,
        studentId,
        parentId
      ]);

      if (result[0].affectedRows === 0) {
        return res.status(404).json({ message: 'No student found with this ID or parent ID mismatch' });
      }
  
      res.json({ message: 'Profile updated successfully!' });
  
    } catch (error) {
      console.error("Error fetching profile data:", error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
  
  async generateOpt(req,res){
        try{
          const {email} = req.body;
          console.log(email);
          if(!email){
            return res.status(400).json({
              success:false,
              message:"email is required"
            })
          }
          const [result] = await db.connection.promise().query("SELECT * FROM parent where email = ?",[email]);
          if(result.length > 0){
            console.log("error grnerating otp")
              return res.status(400).json({success:false, message:'user already exists'})
          }
          const otp = otpGenerator.generate(6,{upperCaseAlphabets: false, specialChars: false,lowerCaseAlphabets: false  })
          if(otp){
            otpData[email] = otp;
            mailSender(email,otp); 
            console.log(otp);
            res.status(200).json({ success:true ,message: "OTP sent successfully" });
          }
        }
        catch(error){
          res.status(500).json({success:false ,message:"failed to generate otp"})
        }
  }

  async adminAttendenceUpdate(req, res) {
    const { student_id, Attendance_id } = req.params;
    const { status } = req.body;
    console.log(status);
  
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Attendance status is required',
      });
    }
  
    try {
     
      const [results] = await db.connection.promise().query(
        `
        UPDATE attendance
        SET status = ?
        WHERE student_id = ? AND attendance_id = ?;
        `,
        [status, student_id, Attendance_id]  
      );
  
    
      if (results.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: 'Attendance record not found',
        });
      }
  
      return res.status(200).json({
        success: true,
        message: 'Attendance updated successfully',
      });
    } catch (error) {
      console.error('Error updating attendance:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update attendance status',
      });
    }
  }
  

  async adminGetAllBus(req, res) {
    try {
      const query = "SELECT * FROM Bus";
      const [rows] = await db.connection.promise().query(query);
      console.log(rows);
      res.status(200).json({buses:rows});
    } catch (error) {
      console.error("Error fetching buses:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
  

  async getAllStudents(req, res) {
    try {
      const sql = `
        SELECT 
          s.student_id, 
          s.name AS student_name, 
          s.age, 
          s.grade, 
          p.parent_id, 
          p.contact_number, 
          p.email AS parent_email, 
          r.rfid_tag_id
        FROM 
          Student s
        LEFT JOIN 
          Parent p ON s.student_id = p.student_id
        LEFT JOIN 
          rfid_card r ON s.student_id = r.student_id;
      `;
      
      const [students] = await db.connection.promise().query(sql);
      
      if (students.length === 0) {
        return res.status(404).json({ message: 'No students found' });
      }
  
      
      res.json({students,length:students.length});
    } catch (error) {
      console.error('Error fetching students:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }


 async updateAttendance() {
    try {
        
        const markAbsentQuery = `
            UPDATE attendance
            SET status = 'Absent'
            WHERE DATE(entry_time) = CURDATE() AND exit_time IS NULL;
        `;
        await db.connection.promise().query(markAbsentQuery);

        // Mark students as "Missed one time scanning" if they only have an entry scan
        const markMissedOneTimeQuery = `
            UPDATE attendance
            SET status = 'Missed one time scanning'
            WHERE DATE(entry_time) = CURDATE() AND exit_time IS NULL;
        `;
        await db.connection.promise().query(markMissedOneTimeQuery);

        console.log("Attendance updated successfully.");
    } catch (error) {
        console.error("Error updating attendance:", error);
    }
}


async abc(){
  console.log("Scheduler just called me");
}

async emergencyAlert(req, res) {
  console.log("from the api", req.body.data);

  const { type, location } = req.body.data;
  const { lat, long } = location;

  const alert = `Emergency Alert: ${type} at location (Lat: ${lat}, Long: ${long})`;

  try {
    const [rows] = await db.connection.promise().query(`
      SELECT email FROM parent
    `);

    if (rows.length === 0) {
      return res.status(404).json({ message: "No parent emails found." });
    }

    rows.forEach(row => {
      EmergencyMail(row.email, alert);
    });

    res.status(200).json({ message: "Emergency alerts sent to all parents." });
  } catch (error) {
    console.error("Error sending emergency alerts:", error);
    res.status(500).json({ message: "Failed to send emergency alerts." });
  }
}

async emergencyMessage(req, res) {
  console.log("from the api - emergency message", req.body.data);

  const { message, location } = req.body.data;
  const { lat, long } = location;

  const alertMessage = `Bus Update: "${message}" at location (Lat: ${lat}, Long: ${long})`;

  try {
    const [rows] = await db.connection.promise().query(`
      SELECT email FROM parent
    `);

    if (rows.length === 0) {
      return res.status(404).json({ message: "No parent emails found." });
    }

    rows.forEach(row => {
      EmergencyMail(row.email, alertMessage);
    });

    res.status(200).json({ message: "Emergency messages sent to all parents." });
  } catch (error) {
    console.error("Error sending emergency messages:", error);
    res.status(500).json({ message: "Failed to send emergency messages." });
  }
}


async updateAttendance() {
  try {
      const markAbsentQuery = `
          UPDATE attendance
          SET status = 'Absent'
          WHERE DATE(entry_time) = CURDATE() AND exit_time IS NULL;
      `;
      await db.connection.promise().query(markAbsentQuery);

      const markMissedOneTimeQuery = `
          UPDATE attendance
          SET status = 'Missed one time scanning'
          WHERE DATE(entry_time) = CURDATE() AND exit_time IS NULL;
      `;
      await db.connection.promise().query(markMissedOneTimeQuery);

      console.log("Attendance updated successfully.");
      const [students] = await db.connection.promise().query(`
          SELECT 
              s.name AS student_name,
              p.email AS parent_email,
              a.status
          FROM attendance a
          JOIN student s ON a.student_id = s.student_id
          JOIN parent p ON s.student_id = p.student_id
          WHERE DATE(a.entry_time) = CURDATE() AND a.status != 'Present';
      `);

      for (const student of students) {
          const { student_name, parent_email, status } = student;

          const message = `
              Dear Parent,
              
              This is to inform you that your child ${student_name} has the attendance status: "${status}" for today.
              
              Regards,
              School Transport System
          `;

         
           EmergencyMail(parent_email, message);
      }

      console.log("Emails sent to parents of students not marked Present.");
  } catch (error) {
      console.error("Error updating attendance or sending emails:", error);
  }
}

async uploadFile(req, res) {
  const file = req.file;
  if(!file) {
    return res.status(400).json({ message: 'No file uploaded' , success:false});
  }
  return res.status(200).json({
    message: 'File uploaded successfully',
    success: true,
    filename: file.filename,
    originalName: file.originalname,
    path: file.path
  });

}

}
  



export default UserController;

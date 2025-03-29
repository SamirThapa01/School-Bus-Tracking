import dbConnector from "../Routes/connection.js";
import otpGenerator from 'otp-generator'
import rfidMail from "../rfidMail.js";
import mailSender from "../mailSender.js";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';
import dotenv from "dotenv";
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
      // Validate required fields
      if (!email || !phoneNumber || !password) {
        return res.status(400).json({ success: false, message: "All fields are required" });
      }
  
      // Check if the user already exists
      const [result] = await db.connection.promise().query("SELECT * FROM parent WHERE email = ?", [email]);
      
  
      if (result.length > 0) {
        return res.status(400).json({ success: false, message: "User already exists" });
      }
  
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
  
      // Insert user into the database
      await db.connection.promise().query(
        "INSERT INTO parent (email, contact_number , password,is_student_linked,student_id) VALUES (?, ?, ?, ?, ?)",
        [email, phoneNumber, hashedPassword,0,null]
      );
  
      // Generate JWT token
      const token = jwt.sign({ email }, process.env.SecretKey);
  
      // Set token in cookie
      res.cookie("token", token, { httpOnly: true, sameSite: 'strict'});
  
      return res.status(201).json({ success: true, message: "User registered successfully", token });
    } catch (error) {
      console.error("Error:", error);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  }
  
  async handelLogin(req,res){
     try{

      const {email, password} = req.body;
      if(!email || !password){
      return res.status(400).json({success:false,message:"Fields are required"});
      }
      const [result] = await db.connection.promise().query("SELECT * FROM parent where email = ?",[email]);
      if(result.length === 0){
       return res.status(400).json({success:false, message:'user not found'})
      }

      const user = result[0];
      const match = await bcrypt.compare(password,user.password);
      if(!match){
        return res.status(401).json({success:false,message:"password is not correct"});
      }
      
      const token = jwt.sign({email},process.env.SecretKey);
      console.log('Created token:', token);
      res.cookie("token", token, { httpOnly: true, sameSite: 'strict'});
      return  res.status(200).json({success:true, message:'user login in success'});

     }catch(err){
      console.error("Error login in user");
      res.status(500).json({success:false, message:"internal server error"})
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

  async handelRfid(req, res) {
    const io = req.io;
    const { rfid, bus_id } = req.body;

    if (!rfid || !bus_id) {
        return res.status(400).json({ error: 'Invalid RFID data or Bus ID' });
    }

    console.log(`Received RFID data: ${rfid}, Bus ID: ${bus_id}`);

    try {
        // Get student information and latest attendance record
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
        
        // Check if we have a record from today
        let isNewDay = true;
        if (entry_time) {
            const entryDate = new Date(entry_time);
            isNewDay = 
                entryDate.getDate() !== currentDate.getDate() || 
                entryDate.getMonth() !== currentDate.getMonth() || 
                entryDate.getFullYear() !== currentDate.getFullYear();
        }

        // Case: New day - create a new entry record regardless of previous status
        if (isNewDay) {
            const insertQuery = `
                INSERT INTO attendance (student_id, bus_id, entry_time, scan_time, status)
                VALUES (?, ?, ?, ?, 'Entry Recorded')`;
            
            const [result] = await db.connection.promise().query(
                insertQuery, 
                [student_id, bus_id, scan_time, scan_time]
            );

            return res.status(200).json({
                message: 'First scan recorded successfully for today.',
                student_name,
                email,
                contact_number,
                scan_time,
                status: 'Entry Recorded'
            });
        }

        // Case: First scan of the day
        if (!entry_time) {
            const insertQuery = `
                INSERT INTO attendance (student_id, bus_id, entry_time, scan_time, status)
                VALUES (?, ?, ?, ?, 'Entry Recorded')`;
            
            const [result] = await db.connection.promise().query(
                insertQuery, 
                [student_id, bus_id, scan_time, scan_time]
            );
            rfidMail(email, student_name, scan_time, "Entry Recorded");
            return res.status(200).json({
                message: 'First scan recorded successfully.',
                student_name,
                email,
                contact_number,
                scan_time,
                status: 'Entry Recorded'
            });
        } 

        // Case: Exit scan already recorded
        if (exit_time) {
            return res.status(200).json({
                message: 'Both entry and exit scans already recorded for today.',
                student_name,
                email,
                contact_number,
                status
            });
        }

        // Case: Second scan - calculate time difference in minutes
        const timeDifferenceInMinutes = Math.floor((scan_time - new Date(entry_time)) / 60000);

        // If second scan is within valid window (20-60 minutes)
        if (timeDifferenceInMinutes >= 20 && timeDifferenceInMinutes <= 60) {
            // Calculate total time (exit_time - entry_time)
            const total_time = timeDifferenceInMinutes; // in minutes

            const updateQuery = `
                UPDATE attendance
                SET exit_time = ?, status = 'Present', total_time = ?
                WHERE attendance_id = ?`;

            await db.connection.promise().query(updateQuery, [scan_time, total_time, attendance_id]);

            // Notify parent
            rfidMail(email, student_name, scan_time, "Present");

            // Emit real-time update
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
            // Second scan too early
            return res.status(200).json({
                message: 'Second scan too early. Please scan again after 20 minutes from entry.',
                student_name,
                email,
                contact_number,
                status: 'Entry Recorded'
            });
        } else {
            // Second scan too late
            return res.status(200).json({
                message: 'Second scan too late. Valid window is 20-60 minutes after entry.',
                student_name,
                email,
                contact_number,
                status: 'Entry Recorded'
            });
        }
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
  async handelGps(req,res){
    const io = req.io;
    io.emit('gpsData',{text:'hello'});
      let latestGPSData = null;
      const { latitude, longitude } = req.body;
    
      if (latitude !== undefined && longitude !== undefined) {
        latestGPSData = { latitude, longitude, timestamp: new Date() };
        console.log(`Received GPS data - Latitude: ${latitude}, Longitude: ${longitude}`);
    
        // Emit GPS data to all connected clients
        io.emit('gpsData', latestGPSData);
    
        res.status(200).json({ message: 'GPS data received successfully' });
      } else {
        res.status(400).json({ error: 'Invalid GPS data' });
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
  
      // SQL query to fetch parent data first
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
  
      // Execute the query to fetch parent and student data
      const [parentResult] = await db.connection.promise().query(parentSql, [email]);
      console.log(parentResult);
  
      // If no parent data is found
      if (parentResult.length === 0) {
        return res.status(404).json({ message: 'No parent data found for this email' });
      }
  
      const parentData = parentResult[0];
  
      // Check if student_id is null or empty (i.e., student data is missing)
      if (!parentData.student_id) {
        return res.status(200).json({ message: 'Student data is missing. Please fill in student details.' });
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
  
      // If student data is found, return the profile data
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
      const parentEmail = req.user.email; // Assuming `email` is part of `req.user`
  
      // Extract student details from the request body
      const { studentName, studentAge, studentGrade, studentRfidTag } = req.body;
  
      // Validate that the student details and RFID tag are provided
      if (!studentName || !studentAge || !studentGrade || !studentRfidTag) {
        return res.status(400).json({ message: 'All student fields (name, age, grade, RFID tag) are required' });
      }
  
      // Query to fetch parent_id using the parent's email
      const parentQuery = `
        SELECT parent_id FROM Parent WHERE email = ?;
      `;
      const [parentResult] = await db.connection.promise().query(parentQuery, [parentEmail]);
  
      // If parent is not found, return an error
      if (parentResult.length === 0) {
        return res.status(404).json({ message: 'Parent not found' });
      }
  
      const parentId = parentResult[0].parent_id; // Get parent_id from the query result
  
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
      const studentId = req.body.studentId;  // Get the student ID from the request body
      const {
        parentId,
        parentPhone,
        parentEmail,
        studentName,
        studentGrade,
        studentRfidTag,
        studentAge
      } = req.body;
  
      // Ensure studentId is provided
      if (!studentId) {
        return res.status(400).json({ message: 'Student ID is required' });
      }
  
      // Ensure rfid_tag_id is valid (not null or empty)
      if (!studentRfidTag || studentRfidTag.trim() === "") {
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
        studentName,
        studentAge,
        studentGrade,
        parentPhone,
        parentEmail,
        studentRfidTag,
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
async  updateAttendance() {
  try {
      console.log('Updating attendance records...');

      const markAbsentQuery = `
          UPDATE attendance 
          SET status = 'Absent'
          WHERE status != 'Present' 
          AND DATE(entry_time) = CURDATE()
          AND exit_time IS NULL;`;


      const markMissedQuery = `
          UPDATE attendance 
          SET status = 'Missed one time scanning'
          WHERE status != 'Present'
          AND DATE(entry_time) = CURDATE()
          AND exit_time IS NOT NULL;`;

      await db.connection.promise().query(markAbsentQuery);
      await db.connection.promise().query(markMissedQuery);

      console.log('Attendance update complete.');
  } catch (error) {
      console.error('Error updating attendance:', error);
  }
}
}
  



export default UserController;

import dbConnector from "../Routes/connection.js";
import otpGenerator from 'otp-generator'
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

  async handelRfid(req,res){
    const io = req.io;
    const { rfid } = req.body;
    io.emit('rfidData',{text:'hello'});

    if (rfid !== undefined) {
      console.log(`Received RFID data: ${rfid}`);
  
      // Emit RFID data to all connected clients
      io.emit('rfidData', { rfid, timestamp: new Date() });
  
      res.status(200).json({ message: 'RFID data received successfully' });
    } else {
      res.status(400).json({ error: 'Invalid RFID data' });
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

  async profileData(req,res){
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
  
    try {
      const email = req.user.email; 
      console.log(email)
  
      // SQL query to fetch parent and student data based on parent email
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
          p.email = ?;
      `;
      
      // Execute the query and get the result
      const result = await db.connection.promise().query(sql, [email]);
      console.log(result[0])
      // If no data is found
      if (result.length === 0) {
        return res.status(404).json({ message: 'No data found for this email' });
      }
      res.json(result[0]); 
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
  
}


export default UserController;

import express from "express";
import UserController from "../Controllers/Users.controller.js";
import upload from "../Multer/Multer.js";
const userController = new UserController();
const SamirRouter = express.Router();
const gpsRouter = express.Router();
const rfidRouter = express.Router();

// ---- react routes ----
SamirRouter.post("/requestOtp",userController.generateOpt);
SamirRouter.post("/verifyOtp",userController.checkOpt);
SamirRouter.post("/userSignup",userController.addUser);
SamirRouter.post("/login",userController.handelLogin);
SamirRouter.get("/verify",userController.verifyToken,userController.checkAuth);
SamirRouter.post("/logout",userController.logout);
SamirRouter.get("/profile",userController.verifyToken,userController.profileData);
SamirRouter.patch("/update/Profile",userController.verifyToken,userController.updateUserProfile)
SamirRouter.get("/get/Allstudents",userController.getAllStudents);
SamirRouter.post("/insert/student",userController.verifyToken,userController.fillStudent);
SamirRouter.post("/admin/insertDetails",userController.adminFillStudent)
SamirRouter.patch("/admin/updateStudent/:student_id",userController.updateStudentDetails);
SamirRouter.put("/admin/updateAttendance/:student_id/:Attendance_id",userController.adminAttendenceUpdate)
SamirRouter.get("/admin/getAllBus",userController.adminGetAllBus);
SamirRouter.delete("/admin/delete/:student_id",userController.deleteStudents)
SamirRouter.get("/admin/attendance",userController.getAttendance)
SamirRouter.post("/admin/insertBus",userController.insertBus);
SamirRouter.delete("/admin/deleteBus/:bus_id",userController.deleteBus);
SamirRouter.get("/getStudent",userController.verifyToken,userController.getStudentAttendance)
SamirRouter.get("/call",userController.abc);
SamirRouter.post('/upload', upload.single('file'),userController.uploadFile);
// Getting user details from database using GET method
SamirRouter.get("/getAllUsers/:id", userController.getUsers);
// Getting all users from database using Get Method
SamirRouter.get("/getAllUsers",userController.getUserData);
// updating data into database using PUT method
SamirRouter.put("/update/:id",userController.updateUser );
// deleting from data base using DELETE method
SamirRouter.delete("/delete/:id",userController.deleteUser);
// backend call
SamirRouter.patch("/update/attendance",userController.updateAttendance);
//emergency api
SamirRouter.post("/emergency",userController.emergencyAlert);
SamirRouter.post("/emergency-message",userController.emergencyMessage);
// ---Gps routes---
// Receiving Gps coordinates 
gpsRouter.post("/",userController.handelGps);

// ---Rfid routes---
// Inserting login details in database
rfidRouter.post("/",userController.handelRfid)


export default {SamirRouter,gpsRouter,rfidRouter};

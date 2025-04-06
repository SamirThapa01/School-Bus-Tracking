import express from "express";
import UserController from "../Controllers/Users.controller.js";
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
SamirRouter.delete("/admin/delete/:student_id",userController.deleteStudents)
SamirRouter.get("/admin/attendance",userController.getAttendance)
SamirRouter.get("/getStudent",userController.verifyToken,userController.getStudentAttendance)
// Getting user details from database using GET method
SamirRouter.get("/getAllUsers/:id", userController.getUsers);
// Getting all users from database using Get Method
SamirRouter.get("/getAllUsers",userController.getUserData);
// updating data into database using PUT method
SamirRouter.put("/update/:id",userController.updateUser );
// deleting from data base using DELETE method
SamirRouter.delete("/delete/:id",userController.deleteUser);


// ---Gps routes---
// Receiving Gps coordinates from IOT
gpsRouter.post("/",userController.handelGps);

// ---Rfid routes---
// Inserting login details in database
rfidRouter.post("/",userController.handelRfid)


export default {SamirRouter,gpsRouter,rfidRouter};

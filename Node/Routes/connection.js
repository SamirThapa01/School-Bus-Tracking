import mysql from "mysql2";
import dotenv from "dotenv";
dotenv.config();

class dbConnector {
  constructor() {
    this.connection = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
    this.promisePool = this.connection.promise();
    this.connect();
  }

  connect() {
    this.connection.getConnection((err, connection) => {
      if (err) {
        console.error("Error connecting to the database:", err);
        return;
      }
      console.log("Connected to the MySQL database");
      connection.release();
    });
  }
}

export default dbConnector;
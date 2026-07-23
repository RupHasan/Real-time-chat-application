require("dotenv").config();
const mysql = require("mysql2");
const fs = require("fs");
const pool = mysql.createPool({
    host: process.env.DB_HOSTNAME,
    user: "avnadmin",
    password: process.env.DB_PASSWORD,
    database: "defaultdb",
    port: process.env.PORT,
    ssl: {
        ca: fs.readFileSync("./ca.pem")
    }
});

// Test the connection
pool.getConnection((err, connection) => {
    if (err) {
        console.error("Error connecting to Aiven:", err.message);
    } else {
        console.log("Successfully connected to Aiven database!");
        connection.release();
    }
});

module.exports = pool.promise();

require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const cookieParser = require("cookie-parser");
const socketIo = require("socket.io");
const http = require("http");
const path = require("path");
const pool = require("./db");
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const port = process.env.PORT || 3000;
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

io.on("connection", async socket => {
    const conn = await pool.getConnection();
    const [results] = await conn.query("SELECT * FROM chatapp;");
    socket.emit("onConnect", results);
    conn.release();

    socket.on("sendMsg", async data => {
        const conn = await pool.getConnection();
        const [results] = await conn.query(
            "INSERT INTO chatapp (username, msg) VALUES (?, ?);",
            ["Anonymous", data]
        );
        conn.release();
        
        sendData = [{username: "Anonymous", msg: data}]
        io.emit("getMsg", sendData);
    });
});

server.listen(port, () => {
    console.log(`Server is connected at port ${port}`);
});

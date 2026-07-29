require("dotenv").config();
// Dependencies
const express = require("express");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const socketIo = require("socket.io");
// Built in tools
const http = require("http");
const path = require("path");
// External files
const pool = require("./db");
const authFile = require("./backend/auth.js");
// Set up
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const port = process.env.PORT || 3000;
app.use(express.static("public"));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

const { authUser } = require("./backend/auth.js");

app.use("/auth", authFile);

app.get("/auth", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "auth.html"));
});

app.get("/", authUser, (req, res) => {
    res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

io.use((socket, next) => {
    const cookie = socket.handshake.headers.cookie;
    const token = cookie?.match(/token=([^;]+)/)?.[1];

    if (!token) {
        next(new Error("Session expired! User must log in again."));
    } else {
        try {
            const decode = jwt.verify(token, process.env.JWT_PASS);
            socket.user = decode;
            next();
        } catch (err) {
            next(new Error("Token is not verified. User must log in again."));
        }
    }
});

io.on("connection", async socket => {
    const conn = await pool.getConnection();
    const [results] = await conn.query("SELECT * FROM chatapp;");
    socket.emit("onConnect", results);
    conn.release();

    socket.on("sendMsg", async data => {
        const username = socket.user.username;
        const conn = await pool.getConnection();
        const [results] = await conn.query(
            "INSERT INTO chatapp (username, msg) VALUES (?, ?);",
            [username, data]
        );
        conn.release();

        sendData = [{ username: username, msg: data }];
        io.emit("getMsg", sendData);
    });
});

server.listen(port, () => {
    console.log(`Server is connected at port ${port}`);
});

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
app.use(express.urlencoded({ extended: true }));

function userAuth() {}

app.post("/auth", async (req, res) => {
    try {
        const { username, password, email, phnNumber } = req.body;
        console.log(username, password, email, phnNumber);

        const conn = await pool.getConnection();
        const [results] = await conn.query(
            "INSERT INTO chatappUsers (username, password, email, phnNumber) VALUES (?,?,?,?);",
            [username, password, email, phnNumber]
        );

        conn.release();
        res.send(results);
    } catch (err) {
        if (err.code == "ER_DUP_ENTRY") {
            res.send("username already exists");
        } else {
            res.send("come on, a new err", err);
        }
    }
});

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

        sendData = [{ username: "Anonymous", msg: data }];
        io.emit("getMsg", sendData);
    });
});

server.listen(port, () => {
    console.log(`Server is connected at port ${port}`);
});

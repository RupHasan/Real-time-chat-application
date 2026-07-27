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
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

function authUser(req, res, next) {
    const token = req.cookies.token;

    if (!token) {
        return res.send(`
            <script>
                alert("User is not logged in!");
                window.location.href = "/auth"
            </script>
        `);
    } else {
        try {
            const decode = jwt.verify(token, process.env.JWT_PASS);
            req.user = decode;
            next();
        } catch (err) {
            return res.send(`
                <script>
                    alert("Token is not verified! Must log in again.");
                    window.location.href = "/auth"
                </script>
            `);
        }
    }
}

app.post("/auth", async (req, res) => {
    let conn;
    try {
        const { username, password, email, phnNumber } = req.body;
        conn = await pool.getConnection();
        const [createAccount] = await conn.query(
            "INSERT INTO chatappUsers (username, password, email, phnNumber) VALUES (?,?,?,?);",
            [username, password, email, phnNumber]
        );
        const [results] = await conn.query(
            "SELECT * FROM chatappUsers WHERE username = ?",
            [username]
        );

        // Jwt processing
        const token = jwt.sign(
            { userId: results[0].id, username: results[0].username },
            process.env.JWT_PASS
        );

        res.cookie("token", token, { httpOnly: true }).send(results);
    } catch (err) {
        if (err.code == "ER_DUP_ENTRY") {
            res.send("username already exists");
        } else {
            res.send(err.code);
        }
    } finally {
        conn.release();
    }
});

app.get("/auth", (req,res)=>{
    res.sendFile(path.join(__dirname, "public", "auth.html"))
})

app.get("/", authUser, (req, res) => {
    res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

io.on("connection", async (socket) => {
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

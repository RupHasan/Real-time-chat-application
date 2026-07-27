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

// Middleware
app.use(express.static("public"));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// ==================== EXPRESS AUTH MIDDLEWARE ====================
function authUser(req, res, next) {
    const token = req.cookies.token;

    if (!token) {
        return res.send(`
            <script>
                alert("User is not logged in!");
                window.location.href = "/auth";
            </script>
        `);
    }

    try {
        const decode = jwt.verify(token, process.env.JWT_PASS);
        req.user = decode;
        next();
    } catch (err) {
        return res.send(`
            <script>
                alert("Token is not verified! Must log in again.");
                window.location.href = "/auth";
            </script>
        `);
    }
}

// ==================== SOCKET.IO AUTH MIDDLEWARE ====================
io.use((socket, next) => {
    // Get cookie from handshake
    const cookie = socket.handshake.headers.cookie;
    
    if (!cookie) {
        return next(new Error("Authentication required: No cookie found"));
    }

    // Extract token from cookie
    const tokenMatch = cookie.match(/token=([^;]+)/);
    if (!tokenMatch) {
        return next(new Error("Authentication required: No token found"));
    }

    const token = tokenMatch[1];

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_PASS);
        socket.user = decoded; // Attach user data to socket
        console.log(`✅ Socket authenticated: ${decoded.username}`);
        next();
    } catch (err) {
        return next(new Error("Invalid token"));
    }
});

// ==================== ROUTES ====================

// Auth page (signup)
app.get("/auth", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "auth.html"));
});

// Signup endpoint
app.post("/auth", async (req, res) => {
    let conn;
    try {
        const { username, password, email, phnNumber } = req.body;

        // Validate input
        if (!username || !password || !email) {
            return res.status(400).json({ error: "Username, password, and email are required" });
        }

        conn = await pool.getConnection();

        // Hash password (IMPORTANT!)
        const hashedPassword = await bcrypt.hash(password, 10);

        const [createAccount] = await conn.query(
            "INSERT INTO chatappUsers (username, password, email, phnNumber) VALUES (?, ?, ?, ?);",
            [username, hashedPassword, email, phnNumber || null]
        );

        const [results] = await conn.query(
            "SELECT id, username, email FROM chatappUsers WHERE username = ?",
            [username]
        );

        // Generate JWT
        const token = jwt.sign(
            { userId: results[0].id, username: results[0].username },
            process.env.JWT_PASS,
            { expiresIn: '7d' }
        );

        // Set cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.status(201).json({
            success: true,
            message: "Account created successfully",
            user: results[0]
        });

    } catch (err) {
        if (err.code === "ER_DUP_ENTRY") {
            res.status(409).json({ error: "Username or email already exists" });
        } else {
            console.error("Signup error:", err);
            res.status(500).json({ error: "Internal server error" });
        }
    } finally {
        if (conn) conn.release();
    }
});

// Dashboard (protected)
app.get("/", authUser, (req, res) => {
    res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

// ==================== SOCKET.IO EVENTS ====================

io.on("connection", async (socket) => {
    console.log(`🟢 User connected: ${socket.user.username} (${socket.id})`);

    try {
        // Send existing messages
        const conn = await pool.getConnection();
        const [results] = await conn.query("SELECT * FROM chatapp ORDER BY created_at ASC;");
        socket.emit("onConnect", results);
        conn.release();
    } catch (err) {
        console.error("Error fetching messages:", err);
        socket.emit("error", "Failed to load messages");
    }

    // Handle new message
    socket.on("sendMsg", async (data) => {
        try {
            const conn = await pool.getConnection();
            
            // Insert message with the authenticated username
            const [results] = await conn.query(
                "INSERT INTO chatapp (username, msg) VALUES (?, ?);",
                [socket.user.username, data]
            );
            
            conn.release();

            // Broadcast to all clients
            const sendData = [{ 
                username: socket.user.username, 
                msg: data,
                created_at: new Date()
            }];
            
            io.emit("getMsg", sendData);
            console.log(`💬 ${socket.user.username}: ${data}`);
            
        } catch (err) {
            console.error("Error sending message:", err);
            socket.emit("error", "Failed to send message");
        }
    });

    // Handle disconnect
    socket.on("disconnect", () => {
        console.log(`🔴 User disconnected: ${socket.user.username} (${socket.id})`);
    });
});

// ==================== START SERVER ====================

server.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
    console.log(`📍 http://localhost:${port}`);
});
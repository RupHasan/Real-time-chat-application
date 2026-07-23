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

server.listen(port, () => {
    console.log(`Server is connected at port ${port}`);
});

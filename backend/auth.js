const router = require("express").Router();
const pool = require("../db");
const jwt = require("jsonwebtoken");

function authUser(req, res, next) {
    const token = req.cookies.token;
    if (!token) return res.redirect("/auth");
    try {
        req.user = jwt.verify(token, process.env.JWT_PASS);
        next();
    } catch {
        res.redirect("/auth");
    }
}

router.post("/:authType", async (req, res) => {
    if (req.params.authType == "signup") {
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

            res.cookie("token", token, { httpOnly: true }).redirect("/");
        } catch (err) {
            if (err.code == "ER_DUP_ENTRY") {
                res.send(`
                    <script>
                        alert("This username already exists. Try using log in insted.");
                        window.location.href = "/auth";
                    </script>
                `);
            } else {
                res.send(err.code);
            }
        } finally {
            conn.release();
        }
    } else if (req.params.authType == "login") {
        const { username, password } = req.body;
        let conn;
        try {
            conn = await pool.getConnection();
            const [results] = await conn.query(
                "SELECT * FROM chatappUsers WHERE username = ?",
                [username]
            );

            if (password === results[0].password) {
                const token = jwt.sign(
                    { userId: results[0].id, username: results[0].username },
                    process.env.JWT_PASS
                );

                res.cookie("token", token, { httpOnly: true }).redirect("/");
            } else {
                res.status(401).send(
                    `<script>
                        alert("Your password is incorrct! Please try again or contact boss for help.");
                        window.location.href = "/auth"
                    </script>`
                );
            }
        } catch (err) {
            if (err.code == "ER_DUP_ENTRY") {
                res.send(`
                    <script>
                        alert("This username already exists. Try using log in insted.");
                        window.location.href = "/auth";
                    </script>
                `);
            }
        } finally {
            conn.release();
        }
    }
});

module.exports = router;
module.exports.authUser = authUser;

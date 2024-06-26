const cors = require("cors");
const express = require("express");
const mysql = require("mysql2/promise");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const bcrypt = require("bcrypt");

const app = express();
app.use(express.json());
app.use(
    cors({
        credentials: true,
        origin: ["http://localhost:8889"],
    }),
);
app.use(cookieParser());

app.use(
    session({
        secret: "secret",
        resave: false,
        saveUninitialized: true,
    }),
);

const port = 5555;
const secret = "mysecret";

let conn = null;

// function init connection mysql
const initMySQL = async () => {
    conn = await mysql.createConnection({
        host: "localhost",
        port: 8889,
        user: "top",
        password: "1234",
        database: "Clinic_Reservation",
    });
};


app.get("/api/users", async (req, res) => {
    const [rows] = await conn.query("SELECT * FROM users");
    res.json(rows);
});


app.post("/api/register", async (req, res) => {
    const { name, numphone, email, password } = req.body;

    const [rows] = await conn.query("SELECT * FROM users WHERE email = ?", email);
    if (rows.length) {
        return res.status(400).send({ message: "Email is already registered" });
    }

    // Hash the password
    const hash = await bcrypt.hash(password, 10);

    const userData = { 
        name,
        numphone,
        email, 
        password: hash 

    };

    try {
        const result = await conn.query("INSERT INTO users SET ?", userData);
    } catch (error) {
        console.error(error);
        res.status(400).json({
            message: "insert fail",
            error,
        });
    }

    res.status(201).send({ message: "User registered successfully" });
});

app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;
  
    const [result] = await conn.query("SELECT * from users WHERE email = ?", email);
    const user = result[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).send({ message: "Invalid email or password" });
    }
  
    res.send({ message: "Login successful" });
  });

// Listen
app.listen(port, async () => {
    await initMySQL();
    console.log("Server started at port 5555");
});
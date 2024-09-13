const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2');
const axios = require('axios');
require('dotenv').config();  // Make sure dotenv is loaded

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5000;
const API_KEY = process.env.OPENWEATHER_API_KEY; // Access API key from environment
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

if (!API_KEY) {
    console.error("API key is missing in environment variables");
    process.exit(1);
}

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Vishal@1662',
    database: 'weatherdb'
});

db.connect((err) => {
    if (err) throw err;
    console.log("MySQL connected...");
});


db.query(`CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL
)`, (err, result) => {
    if (err) throw err;
});

db.query(`CREATE TABLE IF NOT EXISTS search_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    location VARCHAR(255),
    weather_data TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
)`, (err, result) => {
    if (err) throw err;
});


app.post('/api/register', async (req, res) => {
    const { name, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `INSERT INTO users (name, password) VALUES (?, ?)`;
    db.query(query, [name, hashedPassword], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: 'User registered successfully' });
    });
});

app.post('/api/login', (req, res) => {
    const { name, password } = req.body;

    const query = `SELECT * FROM users WHERE name = ?`;
    db.query(query, [name], async (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(400).json({ error: "User not found" });

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

        res.status(200).json({ message: "Login successful", userId: user.id });
    });
});


app.post('/api/weather', async (req, res) => {
    const { userId, location } = req.body;
    if (!location) {
        return res.status(400).json({ error: "Location is required" });
    }

    const apiUrl = `${BASE_URL}?q=${location}&appid=${API_KEY}&units=metric`;
    console.log("Fetching weather data from:", apiUrl);

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.cod !== 200) {
            let errorMessage;
            switch (data.cod) {
                case '404':
                    errorMessage = 'City not found. Please check the location and try again.';
                    break;
                case '401':
                    errorMessage = 'Invalid API key. Please check your API key.';
                    break;
                default:
                    errorMessage = `OpenWeatherMap API error: ${data.message}`;
            }
            return res.status(500).json({ error: errorMessage });
        }

        const weatherData = `Temperature: ${data.main.temp}°C, Condition: ${data.weather[0].description}`;
        const query = `INSERT INTO search_history (user_id, location, weather_data) VALUES (?, ?, ?)`;

        db.query(query, [userId, location, weatherData], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(200).json({ weatherData });
        });
    } catch (error) {
        console.error("Error fetching weather data:", error);
        res.status(500).json({ error: 'Unable to fetch weather data' });
    }
});
app.get('/api/history/:userId', (req, res) => {
    const { userId } = req.params;

    const query = `SELECT location, weather_data, timestamp FROM search_history WHERE user_id = ? ORDER BY timestamp DESC`;
    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error("Error fetching search history:", err);
            return res.status(500).json({ error: err.message });
        }
        res.status(200).json({ history: results });
    });
});
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const multer = require("multer");
const path = require("path");
const http = require("http");
const WebSocket = require("ws");

dotenv.config();

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("uploads"));
app.use(express.static("frontend")); // ✅ Serve frontend files

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

// ✅ Connect to MySQL
db.connect((err) => {
    if (err) {
        console.error("❌ Error connecting to MySQL: ", err);
        return;
    }
    console.log("✅ Connected to MySQL");
});

// ✅ WebSocket Handling
wss.on("connection", (ws) => {
    console.log("📡 New WebSocket connection");

    // ✅ Send real-time sensor data every 5 seconds
    const interval = setInterval(() => {
        db.query("SELECT * FROM Sensor_Data ORDER BY timestamp DESC LIMIT 5", (err, results) => {
            if (err) {
                console.error(err);
                return;
            }
            if (wss.clients.size > 0) {
                ws.send(JSON.stringify({ type: "sensorData", data: results }));
            }
        });
    }, 5000);

    ws.on("message", (message) => {
        console.log("📩 Received message:", message);
        ws.send(JSON.stringify({ type: "confirmation", message: "✅ Message received!" }));
    });

    ws.on("close", () => {
        console.log("🔌 WebSocket disconnected");
        clearInterval(interval);
    });
});

// ✅ API: Get All Farm Locations
app.get("/api/locations", (req, res) => {
    db.query("SELECT location_id, Plantation_area, Soil_type FROM Farm_Location", (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

// ✅ API: Get Sensor Data by Location ID
app.get("/api/sensors", (req, res) => {
    const locationId = req.query.location_id;
    db.query("SELECT * FROM Sensor_Data WHERE location_id = ? ORDER BY timestamp DESC LIMIT 1", [locationId], (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results[0] || {});
    });
});

// ✅ API: Get Plant Locations with Sensor Data
app.get("/api/plant-locations", (req, res) => {
    const query = `
        SELECT 
            fl.location_id, 
            fl.lacate AS Plantation_area, 
            fl.Soil_type, 
            sd.plant_name, 
            sd.temperature, 
            sd.humidity, 
            sd.ph, 
            sd.rainfall,
            u.Urbana AS urban_offset
        FROM Farm_Location fl
        LEFT JOIN Sensor_Data sd ON fl.location_id = sd.location_id
        LEFT JOIN Urban u ON sd.Urban_id = u.id
        ORDER BY fl.location_id;
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error("❌ Error fetching plant locations:", err);
            return res.status(500).send(err);
        }

        console.log("✅ API Data Sent:", results);
        res.json(results);
    });
});

wss.on("connection", ws => {
    console.log("Client connected via WebSocket");
    const interval = setInterval(() => {
      const sensorData = generateSensorData();
      ws.send(JSON.stringify(sensorData));
    }, 1000);
    ws.on("close", () => {
      clearInterval(interval);
      console.log("WebSocket connection closed");
    });
  });
  

/////////////////////////////
function generateSensorData() {
    return {
      timestamp: new Date().toISOString(),
      temperature: (20 + Math.random() * 2.5).toFixed(1),
      humidity: (50 + Math.random() * 30).toFixed(1),
      ph: (5.5 + Math.random() * 2).toFixed(1),
      rainfall: (Math.random() * 10).toFixed(1),
      nitrogen: Math.floor(5 + Math.random() * 10),
      phosphorus: Math.floor(3 + Math.random() * 8),
      potassium: Math.floor(8 + Math.random() * 13),
      organic_matter: (3 + Math.random() * 7).toFixed(1),
      wind_speed: (Math.random() * 5).toFixed(1),
      co2: Math.floor(350 + Math.random() * 150),
      soil_moisture: (10 + Math.random() * 30).toFixed(1)
    };
  }
  



// ✅ API: Add New Sensor Data
app.post("/api/sensors", (req, res) => {
    const { timestamp, temperature, humidity, ph, rainfall, location_id } = req.body;

    const query = `INSERT INTO Sensor_Data (timestamp, temperature, humidity, ph, rainfall, location_id) VALUES (?, ?, ?, ?, ?, ?);`;
    db.query(query, [timestamp, temperature, humidity, ph, rainfall, location_id], (err, result) => {
        if (err) return res.status(500).send(err);
        
        // ✅ Broadcast new sensor data via WebSocket
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ type: "NEW_SENSOR_DATA", data: { timestamp, temperature, humidity, ph, rainfall, location_id } }));
            }
        });

        res.json({ message: "✅ Sensor data added successfully", id: result.insertId });
    });
});

// ✅ File Upload Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

// ✅ API: File Upload
app.post("/api/upload", upload.single("file"), (req, res) => {
    res.json({ message: "✅ File uploaded successfully", filename: req.file.filename });
});

// ✅ Start the Server
server.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});



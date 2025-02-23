const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get all alerts
router.get('/', (req, res) => {
    db.query('SELECT * FROM Alerts ORDER BY created_at DESC', (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

// Create a new alert
router.post('/', (req, res) => {
    const { sensor_id, alert_type, alert_message } = req.body;
    db.query('INSERT INTO Alerts (sensor_id, alert_type, alert_message) VALUES (?, ?, ?)',
        [sensor_id, alert_type, alert_message],
        (err, result) => {
            if (err) return res.status(500).send(err);
            res.json({ message: 'Alert created successfully', id: result.insertId });
        });
});

module.exports = router;

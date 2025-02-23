const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const db = require('../config/db');

// Get all sensor data
router.get('/', (req, res, next) => {
    db.query('SELECT * FROM Sensor_Data ORDER BY timestamp DESC', (err, results) => {
        if (err) return next(err);
        res.json(results);
    });
});

// Add new sensor data (with validation)
router.post(
    '/',
    [
        body('timestamp').isISO8601().withMessage('Invalid timestamp format'),
        body('temperature').isFloat({ min: -50, max: 60 }).withMessage('Temperature must be between -50 and 60°C'),
        body('humidity').isFloat({ min: 0, max: 100 }).withMessage('Humidity must be between 0% and 100%'),
        body('ph').isFloat({ min: 0, max: 14 }).withMessage('pH value must be between 0 and 14'),
        body('rainfall').isFloat({ min: 0 }).withMessage('Rainfall cannot be negative')
    ],
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { timestamp, temperature, humidity, ph, rainfall } = req.body;
        const query = `INSERT INTO Sensor_Data (timestamp, temperature, humidity, ph, rainfall) VALUES (?, ?, ?, ?, ?);`;
        db.query(query, [timestamp, temperature, humidity, ph, rainfall], (err, result) => {
            if (err) return next(err);
            res.json({ message: 'Sensor data added successfully', id: result.insertId });
        });
    }
);

module.exports = router;

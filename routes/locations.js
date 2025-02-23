const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get all farm locations
router.get('/', (req, res) => {
    db.query('SELECT * FROM Farm_Location', (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

// Add new farm location
router.post('/', (req, res) => {
    const { Soil_type } = req.body;
    db.query('INSERT INTO Farm_Location (Soil_type) VALUES (?)', [Soil_type], (err, result) => {
        if (err) return res.status(500).send(err);
        res.json({ message: 'Farm location added successfully', id: result.insertId });
    });
});

module.exports = router;

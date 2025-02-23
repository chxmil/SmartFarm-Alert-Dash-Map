const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get all plants
router.get('/', (req, res) => {
    db.query('SELECT * FROM Plant', (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

// Add a new plant
router.post('/', (req, res) => {
    const { plant_name, season, growth_stage } = req.body;
    db.query('INSERT INTO Plant (plant_name, season, growth_stage) VALUES (?, ?, ?)',
        [plant_name, season, growth_stage],
        (err, result) => {
            if (err) return res.status(500).send(err);
            res.json({ message: 'Plant added successfully', id: result.insertId });
        });
});

// Update plant details
router.put('/:id', (req, res) => {
    const { plant_name, season, growth_stage } = req.body;
    db.query('UPDATE Plant SET plant_name=?, season=?, growth_stage=? WHERE plant_id=?',
        [plant_name, season, growth_stage, req.params.id],
        (err, result) => {
            if (err) return res.status(500).send(err);
            res.json({ message: 'Plant updated successfully' });
        });
});

// Delete a plant
router.delete('/:id', (req, res) => {
    db.query('DELETE FROM Plant WHERE plant_id=?', [req.params.id], (err, result) => {
        if (err) return res.status(500).send(err);
        res.json({ message: 'Plant deleted successfully' });
    });
});

module.exports = router;

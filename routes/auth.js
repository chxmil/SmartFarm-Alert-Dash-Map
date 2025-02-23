const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const db = require('../config/db');

// Register User
router.post(
    '/register',
    [
        body('username').isAlphanumeric().withMessage('Username must be alphanumeric'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    ],
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        db.query('INSERT INTO Users (username, password) VALUES (?, ?)', [username, hashedPassword], (err, result) => {
            if (err) return next(err);
            res.json({ message: 'User registered successfully' });
        });
    }
);

// Login User
router.post(
    '/login',
    [
        body('username').notEmpty().withMessage('Username is required'),
        body('password').notEmpty().withMessage('Password is required')
    ],
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { username, password } = req.body;
        db.query('SELECT * FROM Users WHERE username = ?', [username], async (err, results) => {
            if (err) return next(err);
            if (results.length === 0) return res.status(401).json({ message: 'Invalid username or password' });

            const validPassword = await bcrypt.compare(password, results[0].password);
            if (!validPassword) return res.status(401).json({ message: 'Invalid username or password' });

            const token = jwt.sign({ id: results[0].id }, process.env.JWT_SECRET, { expiresIn: '1h' });
            res.json({ message: 'Login successful', token });
        });
    }
);

module.exports = router;

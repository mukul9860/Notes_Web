const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

router.post('/signup', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    req.db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
        if (err) return res.status(500).json({ message: "Database error" });

        if (results.length > 0) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        try {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            req.db.query('INSERT INTO users (username, password) VALUES (?, ?)', 
            [username, hashedPassword], (err, result) => {
                if (err) return res.status(500).json({ message: "Database error" });
                
                res.status(201).json({ message: 'User registered successfully' });
            });

        } catch (error) {
            res.status(500).json({ message: "Error processing password" });
        }
    });
});

router.post('/login', (req, res) => {
    const { username, password } = req.body;

    req.db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
        if (err) return res.status(500).json({ message: "Database error" });
        
        if (results.length === 0) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const user = results[0];

        try {
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

            const token = jwt.sign(
                { id: user.id, username: user.username }, 
                process.env.JWT_SECRET || 'secretkey123', 
                { expiresIn: '1h' }
            );

            res.json({ token, user: { id: user.id, username: user.username } });
        } catch (error) {
            res.status(500).json({ message: "Login error" });
        }
    });
});

module.exports = router;
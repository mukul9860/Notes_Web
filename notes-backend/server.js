require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const authRoutes = require('./routes/auth');
const noteRoutes = require('./routes/notes');

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

const db = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: '68585@9860',
    database: 'notes_app',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

db.getConnection((err, connection) => {
    if (err) console.error('❌ Database Connection Failed:', err.code);
    else {
        console.log('✅ Connected to MySQL Database');
        connection.release();
    }
});

app.use((req, res, next) => {
    req.db = db;
    next();
});

app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
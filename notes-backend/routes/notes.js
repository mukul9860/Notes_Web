const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');

router.get('/', auth, (req, res) => {
    const { search, is_archived } = req.query;
    let query = `SELECT * FROM notes WHERE is_archived = ? AND user_id = ?`; 
    let params = [is_archived === 'true' ? 1 : 0, req.user.id];

    if (search) {
        query += ` AND (title LIKE ? OR content LIKE ?)`;
        params.push(`%${search}%`, `%${search}%`);
    }
    
    query += ` ORDER BY last_edited DESC`;

    req.db.query(query, params, (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

router.post('/', auth, (req, res) => {
    const { title, content } = req.body;
    if (!title) return res.status(400).send({ message: "Title is required" });

    const sql = `INSERT INTO notes (user_id, title, content) VALUES (?, ?, ?)`;
    req.db.query(sql, [req.user.id, title, content], (err, result) => {
        if (err) return res.status(500).send(err);
        res.json({ id: result.insertId, ...req.body });
    });
});

router.put('/:id', (req, res) => {
    const { title, content, is_archived } = req.body;
    const sql = `UPDATE notes SET title=?, content=?, is_archived=? WHERE id=?`;
    req.db.query(sql, [title, content, is_archived, req.params.id], (err) => {
        if (err) return res.status(500).send(err);
        res.json({ success: true });
    });
});

router.delete('/:id', (req, res) => {
    req.db.query(`DELETE FROM notes WHERE id = ?`, [req.params.id], (err) => {
        if (err) return res.status(500).send(err);
        res.json({ success: true });
    });
});

module.exports = router;
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');

const query = (req, sql, params) => {
    return new Promise((resolve, reject) => {
        req.db.query(sql, params, (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
};

router.get('/', auth, async (req, res) => {
    const { search, is_archived } = req.query;
    
    let sql = `
        SELECT n.*, GROUP_CONCAT(t.name) as tags 
        FROM notes n
        LEFT JOIN note_tags nt ON n.id = nt.note_id
        LEFT JOIN tags t ON nt.tag_id = t.id
        WHERE n.user_id = ? AND n.is_archived = ?
    `;
    
    const params = [req.user.id, is_archived === 'true' ? 1 : 0];

    if (search) {
        sql += ` AND (n.title LIKE ? OR n.content LIKE ? OR t.name LIKE ?)`;
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ` GROUP BY n.id ORDER BY n.last_edited DESC`;

    try {
        const results = await query(req, sql, params);
        const notes = results.map(note => ({
            ...note,
            tags: note.tags ? note.tags.split(',') : []
        }));
        res.json(notes);
    } catch (err) {
        res.status(500).json(err);
    }
});

router.post('/', auth, async (req, res) => {
    const { title, content, tags } = req.body;
    if (!title) return res.status(400).json({ message: "Title is required" });

    try {
        const noteResult = await query(req, 
            `INSERT INTO notes (user_id, title, content) VALUES (?, ?, ?)`, 
            [req.user.id, title, content]
        );
        const noteId = noteResult.insertId;

        if (tags && tags.length > 0) {
            for (const tagName of tags) {
                let tagResult = await query(req, `SELECT id FROM tags WHERE name = ?`, [tagName]);
                let tagId;
                
                if (tagResult.length === 0) {
                    const newTag = await query(req, `INSERT INTO tags (name) VALUES (?)`, [tagName]);
                    tagId = newTag.insertId;
                } else {
                    tagId = tagResult[0].id;
                }

                await query(req, `INSERT INTO note_tags (note_id, tag_id) VALUES (?, ?)`, [noteId, tagId]);
            }
        }

        res.status(201).json({ id: noteId, title, content, tags });
    } catch (err) {
        res.status(500).json(err);
    }
});

router.put('/:id', auth, async (req, res) => {
    const { title, content, is_archived, tags } = req.body;
    const noteId = req.params.id;

    try {
        const check = await query(req, `SELECT id FROM notes WHERE id = ? AND user_id = ?`, [noteId, req.user.id]);
        if (check.length === 0) return res.status(403).json({ message: "Not authorized to edit this note" });

        await query(req, 
            `UPDATE notes SET title=?, content=?, is_archived=? WHERE id=?`, 
            [title, content, is_archived, noteId]
        );
        if (tags) {
            await query(req, `DELETE FROM note_tags WHERE note_id = ?`, [noteId]);
            for (const tagName of tags) {
                let tagResult = await query(req, `SELECT id FROM tags WHERE name = ?`, [tagName]);
                let tagId;
                if (tagResult.length === 0) {
                    const newTag = await query(req, `INSERT INTO tags (name) VALUES (?)`, [tagName]);
                    tagId = newTag.insertId;
                } else {
                    tagId = tagResult[0].id;
                }
                await query(req, `INSERT INTO note_tags (note_id, tag_id) VALUES (?, ?)`, [noteId, tagId]);
            }
        }

        res.json({ success: true });
    } catch (err) {
        res.status(500).json(err);
    }
});

router.delete('/:id', auth, async (req, res) => {
    try {
        const check = await query(req, `SELECT id FROM notes WHERE id = ? AND user_id = ?`, [req.params.id, req.user.id]);
        if (check.length === 0) return res.status(403).json({ message: "Not authorized to delete this note" });

        await query(req, `DELETE FROM notes WHERE id = ?`, [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;
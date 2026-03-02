const express = require('express');
const router = express.Router();
const { db } = require('../db/database');

// POST /api/checklist — add item
router.post('/', (req, res) => {
    const { trip_day_id, text } = req.body;
    if (!trip_day_id || !text) {
        return res.status(400).json({ error: 'trip_day_id and text are required' });
    }

    const maxOrder = db.prepare('SELECT MAX(sort_order) as m FROM checklist_items WHERE trip_day_id = ?').get(trip_day_id);
    const sortOrder = (maxOrder.m || 0) + 1;

    const result = db.prepare('INSERT INTO checklist_items (trip_day_id, text, is_done, sort_order) VALUES (?, ?, 0, ?)')
        .run(trip_day_id, text, sortOrder);

    const item = db.prepare('SELECT * FROM checklist_items WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(item);
});

// PUT /api/checklist/:id — toggle done / update text
router.put('/:id', (req, res) => {
    const { text, is_done } = req.body;

    if (is_done !== undefined) {
        db.prepare('UPDATE checklist_items SET is_done = ? WHERE id = ?').run(is_done ? 1 : 0, req.params.id);
    }
    if (text !== undefined) {
        db.prepare('UPDATE checklist_items SET text = ? WHERE id = ?').run(text, req.params.id);
    }

    const item = db.prepare('SELECT * FROM checklist_items WHERE id = ?').get(req.params.id);
    res.json(item);
});

// DELETE /api/checklist/:id
router.delete('/:id', (req, res) => {
    db.prepare('DELETE FROM checklist_items WHERE id = ?').run(req.params.id);
    res.json({ success: true });
});

module.exports = router;

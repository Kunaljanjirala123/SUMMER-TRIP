const express = require('express');
const router = express.Router();
const { db } = require('../db/database');

// POST /api/places — add place
router.post('/', (req, res) => {
    const { trip_day_id, name, location, duration, map_embed_url, notes } = req.body;
    if (!trip_day_id || !name) {
        return res.status(400).json({ error: 'trip_day_id and name are required' });
    }

    const maxOrder = db.prepare('SELECT MAX(sort_order) as m FROM places WHERE trip_day_id = ?').get(trip_day_id);
    const sortOrder = (maxOrder.m || 0) + 1;

    const result = db.prepare(
        'INSERT INTO places (trip_day_id, name, location, duration, map_embed_url, notes, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(trip_day_id, name, location || '', duration || '', map_embed_url || '', notes || '', sortOrder);

    const place = db.prepare('SELECT * FROM places WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(place);
});

// PUT /api/places/:id — update place
router.put('/:id', (req, res) => {
    const { name, location, duration, map_embed_url, notes } = req.body;
    db.prepare(`UPDATE places SET 
    name = COALESCE(?, name), 
    location = COALESCE(?, location), 
    duration = COALESCE(?, duration), 
    map_embed_url = COALESCE(?, map_embed_url), 
    notes = COALESCE(?, notes) 
    WHERE id = ?`
    ).run(name, location, duration, map_embed_url, notes, req.params.id);

    const place = db.prepare('SELECT * FROM places WHERE id = ?').get(req.params.id);
    res.json(place);
});

// DELETE /api/places/:id
router.delete('/:id', (req, res) => {
    db.prepare('DELETE FROM places WHERE id = ?').run(req.params.id);
    res.json({ success: true });
});

module.exports = router;

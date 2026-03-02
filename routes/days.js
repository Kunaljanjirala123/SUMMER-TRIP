const express = require('express');
const router = express.Router();
const { db } = require('../db/database');

// GET /api/days/:id — full day with flights, places, checklist
router.get('/:id', (req, res) => {
    const day = db.prepare('SELECT * FROM trip_days WHERE id = ?').get(req.params.id);
    if (!day) return res.status(404).json({ error: 'Day not found' });

    day.flights = db.prepare('SELECT * FROM flights WHERE trip_day_id = ? ORDER BY departure_time').all(day.id);
    day.places = db.prepare('SELECT * FROM places WHERE trip_day_id = ? ORDER BY sort_order').all(day.id);
    day.checklist = db.prepare('SELECT * FROM checklist_items WHERE trip_day_id = ? ORDER BY sort_order').all(day.id);

    res.json(day);
});

// POST /api/days — add a new day
router.post('/', (req, res) => {
    const { trip_id, date, title, notes } = req.body;
    if (!trip_id || !date) return res.status(400).json({ error: 'trip_id and date are required' });

    const result = db.prepare('INSERT INTO trip_days (trip_id, date, title, notes) VALUES (?, ?, ?, ?)')
        .run(trip_id, date, title || '', notes || '');

    const day = db.prepare('SELECT * FROM trip_days WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(day);
});

// PUT /api/days/:id — update a day
router.put('/:id', (req, res) => {
    const { title, notes } = req.body;
    db.prepare('UPDATE trip_days SET title = COALESCE(?, title), notes = COALESCE(?, notes) WHERE id = ?')
        .run(title, notes, req.params.id);

    const day = db.prepare('SELECT * FROM trip_days WHERE id = ?').get(req.params.id);
    res.json(day);
});

module.exports = router;

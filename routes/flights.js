const express = require('express');
const router = express.Router();
const { db } = require('../db/database');

// POST /api/flights — add flight
router.post('/', (req, res) => {
    const { trip_day_id, airline, flight_number, departure_city, arrival_city, departure_time, arrival_time, notes } = req.body;
    if (!trip_day_id || !airline || !departure_city || !arrival_city) {
        return res.status(400).json({ error: 'trip_day_id, airline, departure_city, and arrival_city are required' });
    }

    const result = db.prepare(
        'INSERT INTO flights (trip_day_id, airline, flight_number, departure_city, arrival_city, departure_time, arrival_time, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(trip_day_id, airline, flight_number || '', departure_city, arrival_city, departure_time || '', arrival_time || '', notes || '');

    const flight = db.prepare('SELECT * FROM flights WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(flight);
});

// DELETE /api/flights/:id
router.delete('/:id', (req, res) => {
    db.prepare('DELETE FROM flights WHERE id = ?').run(req.params.id);
    res.json({ success: true });
});

module.exports = router;

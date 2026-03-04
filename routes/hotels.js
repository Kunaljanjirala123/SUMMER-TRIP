const express = require('express');
const router = express.Router();
const { db } = require('../db/database');

// POST /api/hotels — add hotel
router.post('/', (req, res) => {
    const { trip_day_id, hotel_name, confirmation_number, address, check_in_time, check_out_time, room_type, notes } = req.body;
    if (!trip_day_id || !hotel_name) {
        return res.status(400).json({ error: 'trip_day_id and hotel_name are required' });
    }

    const result = db.prepare(
        'INSERT INTO hotels (trip_day_id, hotel_name, confirmation_number, address, check_in_time, check_out_time, room_type, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(trip_day_id, hotel_name, confirmation_number || '', address || '', check_in_time || '', check_out_time || '', room_type || '', notes || '');

    const hotel = db.prepare('SELECT * FROM hotels WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(hotel);
});

// DELETE /api/hotels/:id
router.delete('/:id', (req, res) => {
    db.prepare('DELETE FROM hotels WHERE id = ?').run(req.params.id);
    res.json({ success: true });
});

module.exports = router;

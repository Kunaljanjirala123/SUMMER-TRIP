const express = require('express');
const router = express.Router();
const { db } = require('../db/database');

// POST /api/rentalcars — add rental car
router.post('/', (req, res) => {
    const { trip_day_id, company, confirmation_number, car_type, pickup_location, dropoff_location, pickup_time, dropoff_time, notes } = req.body;
    if (!trip_day_id || !company) {
        return res.status(400).json({ error: 'trip_day_id and company are required' });
    }

    const result = db.prepare(
        'INSERT INTO rental_cars (trip_day_id, company, confirmation_number, car_type, pickup_location, dropoff_location, pickup_time, dropoff_time, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(trip_day_id, company, confirmation_number || '', car_type || '', pickup_location || '', dropoff_location || '', pickup_time || '', dropoff_time || '', notes || '');

    const car = db.prepare('SELECT * FROM rental_cars WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(car);
});

// DELETE /api/rentalcars/:id
router.delete('/:id', (req, res) => {
    db.prepare('DELETE FROM rental_cars WHERE id = ?').run(req.params.id);
    res.json({ success: true });
});

module.exports = router;

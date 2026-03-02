const express = require('express');
const router = express.Router();
const { db } = require('../db/database');

// GET /api/trips — list all trips
router.get('/', (req, res) => {
    const trips = db.prepare('SELECT * FROM trips ORDER BY start_date').all();
    res.json(trips);
});

// GET /api/trips/:id — single trip with all days
router.get('/:id', (req, res) => {
    const trip = db.prepare('SELECT * FROM trips WHERE id = ?').get(req.params.id);
    if (!trip) return res.status(404).json({ error: 'Trip not found' });

    const days = db.prepare('SELECT * FROM trip_days WHERE trip_id = ? ORDER BY date').all(req.params.id);

    // Attach summary counts to each day
    for (const day of days) {
        day.flightCount = db.prepare('SELECT COUNT(*) as c FROM flights WHERE trip_day_id = ?').get(day.id).c;
        day.placeCount = db.prepare('SELECT COUNT(*) as c FROM places WHERE trip_day_id = ?').get(day.id).c;
        day.checklistTotal = db.prepare('SELECT COUNT(*) as c FROM checklist_items WHERE trip_day_id = ?').get(day.id).c;
        day.checklistDone = db.prepare('SELECT COUNT(*) as c FROM checklist_items WHERE trip_day_id = ? AND is_done = 1').get(day.id).c;
    }

    res.json({ ...trip, days });
});

module.exports = router;

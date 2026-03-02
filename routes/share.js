const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { db } = require('../db/database');

// POST /api/share — generate a share link
router.post('/', (req, res) => {
    const { trip_id, permission_level } = req.body;
    if (!trip_id || !permission_level) {
        return res.status(400).json({ error: 'trip_id and permission_level are required' });
    }
    if (!['complete', 'common'].includes(permission_level)) {
        return res.status(400).json({ error: 'permission_level must be "complete" or "common"' });
    }

    const token = uuidv4();
    db.prepare('INSERT INTO share_links (trip_id, token, permission_level) VALUES (?, ?, ?)')
        .run(trip_id, token, permission_level);

    res.status(201).json({ token, permission_level, url: `/shared.html?token=${token}` });
});

// GET /api/share/links/:tripId — list share links for admin
router.get('/links/:tripId', (req, res) => {
    const links = db.prepare('SELECT * FROM share_links WHERE trip_id = ? ORDER BY created_at DESC').all(req.params.tripId);
    res.json(links);
});

// GET /api/share/:token — fetch trip data filtered by permission
router.get('/:token', (req, res) => {
    const link = db.prepare('SELECT * FROM share_links WHERE token = ?').get(req.params.token);
    if (!link) return res.status(404).json({ error: 'Share link not found or expired' });

    const trip = db.prepare('SELECT * FROM trips WHERE id = ?').get(link.trip_id);
    if (!trip) return res.status(404).json({ error: 'Trip not found' });

    const days = db.prepare('SELECT * FROM trip_days WHERE trip_id = ? ORDER BY date').all(link.trip_id);

    for (const day of days) {
        day.places = db.prepare('SELECT * FROM places WHERE trip_day_id = ? ORDER BY sort_order').all(day.id);

        if (link.permission_level === 'complete') {
            day.flights = db.prepare('SELECT * FROM flights WHERE trip_day_id = ? ORDER BY departure_time').all(day.id);
            day.checklist = db.prepare('SELECT * FROM checklist_items WHERE trip_day_id = ? ORDER BY sort_order').all(day.id);
        }
        // Expenses are NEVER included in shared links
    }

    res.json({
        trip,
        days,
        permission_level: link.permission_level
    });
});

// DELETE /api/share/:id — delete a share link  
router.delete('/:id', (req, res) => {
    db.prepare('DELETE FROM share_links WHERE id = ?').run(req.params.id);
    res.json({ success: true });
});

module.exports = router;

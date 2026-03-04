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

// GET /api/flights/status/:flightNumber — proxy to AviationStack for live status
router.get('/status/:flightNumber', async (req, res) => {
    const apiKey = process.env.AVIATIONSTACK_API_KEY || 'd37f549c8bc9197d3ad40b5b3026faf1';
    if (!apiKey) {
        return res.status(503).json({ error: 'Flight status API not configured' });
    }

    const flightNum = req.params.flightNumber.replace(/\s+/g, '');

    try {
        const url = `http://api.aviationstack.com/v1/flights?access_key=${apiKey}&flight_iata=${flightNum}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
            return res.status(502).json({ error: data.error.message || 'API error' });
        }

        if (!data.data || data.data.length === 0) {
            return res.json({ status: 'not_found', message: 'No live data found for this flight' });
        }

        const flight = data.data[0];
        res.json({
            status: flight.flight_status || 'unknown',
            airline: flight.airline?.name || '',
            flight_iata: flight.flight?.iata || flightNum,
            departure: {
                airport: flight.departure?.airport || '',
                iata: flight.departure?.iata || '',
                terminal: flight.departure?.terminal || '',
                gate: flight.departure?.gate || '',
                scheduled: flight.departure?.scheduled || '',
                estimated: flight.departure?.estimated || '',
                actual: flight.departure?.actual || '',
                delay: flight.departure?.delay || null
            },
            arrival: {
                airport: flight.arrival?.airport || '',
                iata: flight.arrival?.iata || '',
                terminal: flight.arrival?.terminal || '',
                gate: flight.arrival?.gate || '',
                scheduled: flight.arrival?.scheduled || '',
                estimated: flight.arrival?.estimated || '',
                actual: flight.arrival?.actual || '',
                delay: flight.arrival?.delay || null
            },
            live: flight.live || null
        });
    } catch (err) {
        console.error('AviationStack API error:', err.message);
        res.status(502).json({ error: 'Failed to fetch flight status' });
    }
});

// DELETE /api/flights/:id
router.delete('/:id', (req, res) => {
    db.prepare('DELETE FROM flights WHERE id = ?').run(req.params.id);
    res.json({ success: true });
});

module.exports = router;

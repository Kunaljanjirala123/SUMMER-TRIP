const express = require('express');
const path = require('path');
const { initialize } = require('./db/database');
const { seed } = require('./db/seed');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/trips', require('./routes/trips'));
app.use('/api/days', require('./routes/days'));
app.use('/api/flights', require('./routes/flights'));
app.use('/api/places', require('./routes/places'));
app.use('/api/checklist', require('./routes/checklist'));
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/share', require('./routes/share'));

// Initialize DB and seed data
initialize();
seed();

app.listen(PORT, () => {
    console.log(`\n🌴 Mom & Dad Travel Itinerary is running at http://localhost:${PORT}\n`);
});

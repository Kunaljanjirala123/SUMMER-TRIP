const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const { initialize } = require('./db/database');
const { seed } = require('./db/seed');
const { router: authRouter, requireAuth } = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// --- Public routes (no auth required) ---

// Login page and auth API
app.use('/api/auth', authRouter);

// Shared view page and API (always public)
app.use('/api/share', require('./routes/share'));

// Serve public static assets (CSS, JS) without auth
app.use('/css', express.static(path.join(__dirname, 'public', 'css')));
app.use('/js', express.static(path.join(__dirname, 'public', 'js')));
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// Login page — always accessible
app.get('/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Shared page — always accessible
app.get('/shared.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'shared.html'));
});

// --- Protected routes (auth required) ---

// Protect all API routes
app.use('/api/trips', requireAuth, require('./routes/trips'));
app.use('/api/days', requireAuth, require('./routes/days'));
app.use('/api/flights', requireAuth, require('./routes/flights'));
app.use('/api/places', requireAuth, require('./routes/places'));
app.use('/api/checklist', requireAuth, require('./routes/checklist'));
app.use('/api/expenses', requireAuth, require('./routes/expenses'));

// Protect HTML pages
app.get('/', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/index.html', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/day.html', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'day.html'));
});

app.get('/admin.html', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/expenses.html', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'expenses.html'));
});

// Favicon
app.get('/favicon.ico', (req, res) => res.status(204).end());

// Initialize DB and seed data
initialize();
seed();

app.listen(PORT, () => {
    console.log(`\n🌴 Mom & Dad Travel Itinerary is running at http://localhost:${PORT}\n`);
});

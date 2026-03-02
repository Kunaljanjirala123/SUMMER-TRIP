const express = require('express');
const crypto = require('crypto');
const router = express.Router();

// Default password — change via environment variable AUTH_PASSWORD
const AUTH_PASSWORD = process.env.AUTH_PASSWORD || 'Sanvitha@12';

// Simple token store (in-memory, resets on server restart)
const validTokens = new Set();

// POST /api/auth/login
router.post('/login', (req, res) => {
    const { password } = req.body;
    if (!password) return res.status(400).json({ error: 'Password is required' });

    if (password === AUTH_PASSWORD) {
        const token = crypto.randomBytes(32).toString('hex');
        validTokens.add(token);

        // Set HTTP-only cookie valid for 7 days
        res.cookie('auth_token', token, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            sameSite: 'lax',
            path: '/'
        });

        return res.json({ success: true });
    }

    res.status(401).json({ error: 'Incorrect password' });
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
    const token = req.cookies?.auth_token;
    if (token) validTokens.delete(token);
    res.clearCookie('auth_token');
    res.json({ success: true });
});

// GET /api/auth/check — check if currently authenticated
router.get('/check', (req, res) => {
    const token = req.cookies?.auth_token;
    const authenticated = token && validTokens.has(token);
    res.json({ authenticated });
});

// Middleware to protect routes
function requireAuth(req, res, next) {
    const token = req.cookies?.auth_token;
    if (token && validTokens.has(token)) return next();

    // If requesting a page, redirect to login
    if (req.accepts('html')) {
        return res.redirect('/login.html');
    }

    res.status(401).json({ error: 'Authentication required' });
}

module.exports = { router, requireAuth };

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { db } = require('../db/database');

// Configure multer for receipt uploads
const uploadDir = path.join(__dirname, '..', 'public', 'uploads', 'receipts');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|gif|webp|pdf/;
        const extOk = allowed.test(path.extname(file.originalname).toLowerCase());
        const mimeOk = allowed.test(file.mimetype);
        cb(null, extOk || mimeOk);
    }
});

// GET /api/expenses/:tripId — list all expenses
router.get('/:tripId', (req, res) => {
    const expenses = db.prepare(`
    SELECT e.*, td.date, td.title as day_title
    FROM expenses e
    LEFT JOIN trip_days td ON e.trip_day_id = td.id
    WHERE e.trip_id = ?
    ORDER BY e.created_at DESC
  `).all(req.params.tripId);

    const total = db.prepare('SELECT SUM(amount) as total FROM expenses WHERE trip_id = ?').get(req.params.tripId);

    res.json({ expenses, total: total.total || 0 });
});

// POST /api/expenses — add expense
router.post('/', upload.single('receipt'), (req, res) => {
    const { trip_id, trip_day_id, category, description, amount } = req.body;
    if (!trip_id || !category || !amount) {
        return res.status(400).json({ error: 'trip_id, category, and amount are required' });
    }

    const receiptPath = req.file ? '/uploads/receipts/' + req.file.filename : null;

    const result = db.prepare(
        'INSERT INTO expenses (trip_id, trip_day_id, category, description, amount, receipt_image_path) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(trip_id, trip_day_id || null, category, description || '', parseFloat(amount), receiptPath);

    const expense = db.prepare('SELECT * FROM expenses WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(expense);
});

// DELETE /api/expenses/:id
router.delete('/item/:id', (req, res) => {
    const expense = db.prepare('SELECT * FROM expenses WHERE id = ?').get(req.params.id);
    if (expense && expense.receipt_image_path) {
        const fullPath = path.join(__dirname, '..', 'public', expense.receipt_image_path);
        if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    }
    db.prepare('DELETE FROM expenses WHERE id = ?').run(req.params.id);
    res.json({ success: true });
});

module.exports = router;

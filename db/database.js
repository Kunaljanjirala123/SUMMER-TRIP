const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'travel.db');
const fs = require('fs');
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new Database(dbPath);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function initialize() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS trips (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS trip_days (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trip_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      title TEXT,
      notes TEXT,
      FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS flights (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trip_day_id INTEGER NOT NULL,
      airline TEXT NOT NULL,
      flight_number TEXT,
      departure_city TEXT NOT NULL,
      arrival_city TEXT NOT NULL,
      departure_time TEXT,
      arrival_time TEXT,
      notes TEXT,
      FOREIGN KEY (trip_day_id) REFERENCES trip_days(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS places (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trip_day_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      location TEXT,
      duration TEXT,
      map_embed_url TEXT,
      notes TEXT,
      sort_order INTEGER DEFAULT 0,
      FOREIGN KEY (trip_day_id) REFERENCES trip_days(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS checklist_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trip_day_id INTEGER NOT NULL,
      text TEXT NOT NULL,
      is_done INTEGER DEFAULT 0,
      sort_order INTEGER DEFAULT 0,
      FOREIGN KEY (trip_day_id) REFERENCES trip_days(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trip_id INTEGER NOT NULL,
      trip_day_id INTEGER,
      category TEXT NOT NULL,
      description TEXT,
      amount REAL NOT NULL,
      receipt_image_path TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
      FOREIGN KEY (trip_day_id) REFERENCES trip_days(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS share_links (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trip_id INTEGER NOT NULL,
      token TEXT NOT NULL UNIQUE,
      permission_level TEXT NOT NULL CHECK(permission_level IN ('complete', 'common')),
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
    );
  `);
}

module.exports = { db, initialize };

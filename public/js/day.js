// --- Day View (Full Itinerary — Consolidated Hub) ---

let dayData = null;
let tripDays = [];

document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const dayId = params.get('id');
    if (!dayId) {
        window.location.href = '/';
        return;
    }

    await loadDay(dayId);
    await loadTripDays();
    setupNavScroll();
});

async function loadDay(dayId) {
    try {
        const res = await fetch(`/api/days/${dayId}`);
        if (!res.ok) throw new Error('Day not found');
        dayData = await res.json();
        renderDay();
    } catch (err) {
        console.error(err);
        document.getElementById('dayTitle').textContent = 'Day not found';
    }
}

async function loadTripDays() {
    try {
        const res = await fetch('/api/trips');
        const trips = await res.json();
        if (trips.length > 0) {
            const tripRes = await fetch(`/api/trips/${trips[0].id}`);
            const trip = await tripRes.json();
            tripDays = trip.days;
            renderDayNav();
        }
    } catch (err) {
        console.error(err);
    }
}

function renderDay() {
    // Header
    document.getElementById('dateBadge').textContent = `📅 ${formatDate(dayData.date)}`;
    document.getElementById('dayTitle').textContent = dayData.title || 'Untitled Day';
    document.getElementById('dayNotes').textContent = dayData.notes || '';
    document.title = `${dayData.title || dayData.date} — Travel Planner`;

    // Flights — Premium Boarding Pass
    if (dayData.flights && dayData.flights.length > 0) {
        document.getElementById('flightsSection').style.display = 'block';
        document.getElementById('flightsList').innerHTML = dayData.flights.map(f => renderFlightCard(f)).join('');
    }

    // Rental Cars
    if (dayData.rental_cars && dayData.rental_cars.length > 0) {
        document.getElementById('rentalCarsSection').style.display = 'block';
        document.getElementById('rentalCarsList').innerHTML = dayData.rental_cars.map(c => renderRentalCarCard(c)).join('');
    }

    // Hotels
    if (dayData.hotels && dayData.hotels.length > 0) {
        document.getElementById('hotelsSection').style.display = 'block';
        document.getElementById('hotelsList').innerHTML = dayData.hotels.map(h => renderHotelCard(h)).join('');
    }

    // Places
    if (dayData.places && dayData.places.length > 0) {
        document.getElementById('placesSection').style.display = 'block';
        document.getElementById('placesList').innerHTML = dayData.places.map(p => `
      <div class="place-card animate-in">
        <div class="place-card-content">
          <div class="place-name">${p.name}</div>
          <div class="place-meta">
            ${p.location ? `<span>📍 ${p.location}</span>` : ''}
            ${p.duration ? `<span>⏱️ ${p.duration}</span>` : ''}
          </div>
          ${p.notes ? `<div class="place-notes">"${p.notes}"</div>` : ''}
        </div>
        ${p.map_embed_url ? `<iframe class="place-map" src="${p.map_embed_url}" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>` : ''}
      </div>
    `).join('');
    }

    // Checklist
    if (dayData.checklist && dayData.checklist.length > 0) {
        document.getElementById('checklistSection').style.display = 'block';
        renderChecklist();
    } else {
        document.getElementById('checklistSection').style.display = 'block';
        renderChecklist();
    }

    // Setup checklist add
    document.getElementById('addChecklistBtn').addEventListener('click', addChecklistItem);
    document.getElementById('newChecklistItem').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addChecklistItem();
    });
}

// --- Premium Flight Card (Boarding Pass) ---
function renderFlightCard(f) {
    const depCity = f.departure_city;
    const arrCity = f.arrival_city;
    const flightNum = f.flight_number || '';
    const hasFlightNum = flightNum.trim().length > 0;

    return `
    <div class="flight-card" id="flight-card-${f.id}">
      <!-- Top: Airline + Flight Number -->
      <div class="flight-top">
        <div class="flight-airline">
          <div class="flight-airline-icon">✈️</div>
          <div class="flight-airline-name">${f.airline}</div>
        </div>
        ${hasFlightNum ? `<div class="flight-number-badge">✈  ${flightNum}</div>` : ''}
      </div>

      <!-- Route with animated plane -->
      <div class="flight-route-row">
        <div class="flight-city">
          <div class="flight-city-code">${getCityCode(depCity)}</div>
          <div class="flight-city-name">${depCity}</div>
        </div>
        <div class="flight-path">
          <div class="flight-path-line"></div>
          <div class="flight-path-plane">✈️</div>
        </div>
        <div class="flight-city">
          <div class="flight-city-code">${getCityCode(arrCity)}</div>
          <div class="flight-city-name">${arrCity}</div>
        </div>
      </div>

      <!-- Tear line -->
      <hr class="flight-tear-line">

      <!-- Bottom: Times -->
      <div class="flight-bottom">
        ${f.departure_time ? `
        <div class="flight-time-block">
          <div class="flight-time-label">Departure</div>
          <div class="flight-time-value">${f.departure_time}</div>
        </div>` : ''}
        ${f.arrival_time ? `
        <div class="flight-time-block">
          <div class="flight-time-label">Arrival</div>
          <div class="flight-time-value">${f.arrival_time}</div>
        </div>` : ''}
        <div class="flight-date-badge">📅 ${formatDateShort(dayData.date)}</div>
      </div>

      ${f.notes ? `<div class="flight-notes-line">📝 ${f.notes}</div>` : ''}

      <!-- Live Status Strip -->
      ${hasFlightNum ? `
      <div class="flight-status-strip" id="flight-status-${f.id}">
        <button class="btn-check-status" onclick="checkFlightStatus('${flightNum.replace(/'/g, "\\'")}', ${f.id})">
          📡 Check Live Status
        </button>
      </div>` : ''}
      <div class="flight-status-details" id="flight-details-${f.id}" style="display:none;"></div>
    </div>`;
}

// Extract a 3-letter city code or abbreviation from a city name
function getCityCode(cityName) {
    if (!cityName) return '---';
    // If it's already a 3-letter code
    if (/^[A-Z]{3}$/i.test(cityName.trim())) return cityName.trim().toUpperCase();
    // Common airport code mappings
    const codes = {
        'new york': 'NYC', 'los angeles': 'LAX', 'chicago': 'ORD', 'dallas': 'DFW',
        'houston': 'IAH', 'san francisco': 'SFO', 'seattle': 'SEA', 'boston': 'BOS',
        'atlanta': 'ATL', 'miami': 'MIA', 'denver': 'DEN', 'orlando': 'MCO',
        'las vegas': 'LAS', 'phoenix': 'PHX', 'minneapolis': 'MSP', 'detroit': 'DTW',
        'philadelphia': 'PHL', 'london': 'LHR', 'paris': 'CDG', 'tokyo': 'NRT',
        'hyderabad': 'HYD', 'delhi': 'DEL', 'mumbai': 'BOM', 'bangalore': 'BLR',
        'chennai': 'MAA', 'kolkata': 'CCU', 'washington': 'IAD', 'charlotte': 'CLT',
        'san diego': 'SAN', 'tampa': 'TPA', 'portland': 'PDX', 'austin': 'AUS',
        'nashville': 'BNA', 'raleigh': 'RDU', 'salt lake city': 'SLC',
        'san antonio': 'SAT', 'jacksonville': 'JAX', 'columbus': 'CMH',
        'fort lauderdale': 'FLL', 'indianapolis': 'IND', 'pittsburgh': 'PIT',
        'cincinnati': 'CVG', 'st louis': 'STL', 'kansas city': 'MCI',
        'cleveland': 'CLE', 'newark': 'EWR', 'honolulu': 'HNL',
        'sacramento': 'SMF', 'new orleans': 'MSY'
    };
    const lower = cityName.trim().toLowerCase();
    if (codes[lower]) return codes[lower];
    // Fallback: first 3 letters
    return cityName.trim().substring(0, 3).toUpperCase();
}

// Check live flight status via our proxy
async function checkFlightStatus(flightNumber, flightId) {
    const strip = document.getElementById(`flight-status-${flightId}`);
    const detailsEl = document.getElementById(`flight-details-${flightId}`);
    if (!strip) return;

    const btn = strip.querySelector('.btn-check-status');
    if (btn) {
        btn.classList.add('loading');
        btn.textContent = '⏳ Checking...';
    }

    try {
        const cleanNum = flightNumber.replace(/\s+/g, '');
        const res = await fetch(`/api/flights/status/${cleanNum}`);
        const data = await res.json();

        if (data.error || data.status === 'not_found') {
            strip.innerHTML = `
              <div class="flight-status-badge status-unknown">
                <span class="live-dot" style="background:#9e9e9e;animation:none;"></span>
                ${data.message || 'No live data available'}
              </div>`;
            return;
        }

        const statusClass = getStatusClass(data.status);
        const dotClass = data.status === 'delayed' ? 'delayed' : data.status === 'cancelled' ? 'cancelled' : '';
        const statusLabel = data.status.charAt(0).toUpperCase() + data.status.slice(1).replace('_', ' ');

        strip.innerHTML = `
          <div class="flight-status-badge ${statusClass}">
            <span class="live-dot ${dotClass}"></span>
            ${statusLabel}
          </div>
          <button class="btn-check-status" onclick="checkFlightStatus('${flightNumber.replace(/'/g, "\\'")}', ${flightId})">
            🔄 Refresh
          </button>`;

        // Show extra details
        let details = [];
        if (data.departure.gate) details.push(`<span>🚪 Gate ${data.departure.gate}</span>`);
        if (data.departure.terminal) details.push(`<span>🏢 Terminal ${data.departure.terminal}</span>`);
        if (data.departure.delay) details.push(`<span>⏱️ ${data.departure.delay}min delay</span>`);
        if (data.arrival.gate) details.push(`<span>🛬 Arrival Gate ${data.arrival.gate}</span>`);
        if (data.arrival.terminal) details.push(`<span>🏢 Arr Terminal ${data.arrival.terminal}</span>`);

        if (details.length > 0) {
            detailsEl.style.display = 'flex';
            detailsEl.innerHTML = details.join('');
        }
    } catch (err) {
        console.error('Flight status error:', err);
        strip.innerHTML = `
          <div class="flight-status-badge status-unknown">
            <span class="live-dot" style="background:#9e9e9e;animation:none;"></span>
            Could not fetch status
          </div>`;
    }
}

function getStatusClass(status) {
    const map = {
        'active': 'status-active', 'en-route': 'status-active',
        'scheduled': 'status-scheduled',
        'delayed': 'status-delayed',
        'cancelled': 'status-cancelled',
        'landed': 'status-landed',
        'diverted': 'status-delayed'
    };
    return map[status] || 'status-unknown';
}

// --- Rental Car Card ---
function renderRentalCarCard(c) {
    return `
    <div class="rental-car-card">
      <div class="rental-car-icon">🚗</div>
      <div class="rental-car-info">
        <div class="rental-car-company">${c.company}</div>
        ${c.confirmation_number ? `<div class="rental-car-conf">🔖 Conf: ${c.confirmation_number}</div>` : ''}
        <div class="rental-car-details">
          ${c.car_type ? `<span>🚙 ${c.car_type}</span>` : ''}
          ${c.pickup_location ? `<span>📍 Pick-up: ${c.pickup_location}</span>` : ''}
          ${c.dropoff_location ? `<span>📍 Drop-off: ${c.dropoff_location}</span>` : ''}
          ${c.pickup_time ? `<span>🕐 Pick-up: ${c.pickup_time}</span>` : ''}
          ${c.dropoff_time ? `<span>🕐 Drop-off: ${c.dropoff_time}</span>` : ''}
        </div>
        ${c.notes ? `<div class="rental-car-notes">📝 ${c.notes}</div>` : ''}
      </div>
    </div>`;
}

// --- Hotel Card ---
function renderHotelCard(h) {
    return `
    <div class="hotel-card">
      <div class="hotel-icon">🏨</div>
      <div class="hotel-info">
        <div class="hotel-name">${h.hotel_name}</div>
        ${h.confirmation_number ? `<div class="hotel-conf">🔖 Conf: ${h.confirmation_number}</div>` : ''}
        <div class="hotel-details">
          ${h.address ? `<span>📍 ${h.address}</span>` : ''}
          ${h.room_type ? `<span>🛏️ ${h.room_type}</span>` : ''}
          ${h.check_in_time ? `<span>🕐 Check-in: ${h.check_in_time}</span>` : ''}
          ${h.check_out_time ? `<span>🕐 Check-out: ${h.check_out_time}</span>` : ''}
        </div>
        ${h.notes ? `<div class="hotel-notes">📝 ${h.notes}</div>` : ''}
      </div>
    </div>`;
}

// --- Checklist ---
function renderChecklist() {
    const list = document.getElementById('checklistItems');
    if (!dayData.checklist || dayData.checklist.length === 0) {
        list.innerHTML = '<li style="padding: 12px; color: var(--text-muted); font-size: 0.9rem;">No tasks yet. Add one below!</li>';
        return;
    }

    list.innerHTML = dayData.checklist.map(item => `
    <li class="checklist-item ${item.is_done ? 'done' : ''}" data-id="${item.id}">
      <div class="checklist-checkbox" onclick="toggleChecklist(${item.id}, ${item.is_done ? 0 : 1})">
        ${item.is_done ? '✓' : ''}
      </div>
      <span class="checklist-text">${item.text}</span>
      <button class="btn btn-icon btn-soft btn-sm checklist-delete" onclick="deleteChecklist(${item.id})" title="Delete">✕</button>
    </li>
  `).join('');
}

async function toggleChecklist(id, newState) {
    try {
        await fetch(`/api/checklist/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ is_done: newState })
        });

        const item = dayData.checklist.find(c => c.id === id);
        if (item) item.is_done = newState;
        renderChecklist();
        showToast(newState ? '✅ Task completed!' : '↩️ Task unchecked', 'success');
    } catch (err) {
        showToast('Failed to update task', 'error');
    }
}

async function deleteChecklist(id) {
    try {
        await fetch(`/api/checklist/${id}`, { method: 'DELETE' });
        dayData.checklist = dayData.checklist.filter(c => c.id !== id);
        renderChecklist();
        showToast('🗑️ Task deleted', 'success');
    } catch (err) {
        showToast('Failed to delete task', 'error');
    }
}

async function addChecklistItem() {
    const input = document.getElementById('newChecklistItem');
    const text = input.value.trim();
    if (!text) return;

    try {
        const res = await fetch('/api/checklist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ trip_day_id: dayData.id, text })
        });
        const newItem = await res.json();
        if (!dayData.checklist) dayData.checklist = [];
        dayData.checklist.push(newItem);
        renderChecklist();
        input.value = '';
        showToast('✅ Task added!', 'success');
    } catch (err) {
        showToast('Failed to add task', 'error');
    }
}

function renderDayNav() {
    const nav = document.getElementById('dayNav');
    const currentIndex = tripDays.findIndex(d => d.id === dayData.id);

    let html = '';
    if (currentIndex > 0) {
        const prev = tripDays[currentIndex - 1];
        html += `<a href="/day.html?id=${prev.id}" class="day-nav-btn">← ${prev.title || prev.date}</a>`;
    } else {
        html += `<div></div>`;
    }

    if (currentIndex < tripDays.length - 1) {
        const next = tripDays[currentIndex + 1];
        html += `<a href="/day.html?id=${next.id}" class="day-nav-btn">${next.title || next.date} →</a>`;
    }

    nav.innerHTML = html;
}

function formatDate(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function formatDateShort(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function showToast(message, type = '') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    setTimeout(() => toast.classList.remove('show'), 3000);
}

function setupNavScroll() {
    const nav = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        nav.classList.toggle('scrolled', window.scrollY > 10);
    });
}

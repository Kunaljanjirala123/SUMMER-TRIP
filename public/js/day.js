// --- Day View (Full Itinerary) ---

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

    // Flights
    if (dayData.flights && dayData.flights.length > 0) {
        document.getElementById('flightsSection').style.display = 'block';
        document.getElementById('flightsList').innerHTML = dayData.flights.map(f => `
      <div class="flight-card animate-in">
        <div class="flight-icon">✈️</div>
        <div class="flight-info">
          <div class="flight-route">${f.departure_city} → ${f.arrival_city}</div>
          <div class="flight-details">
            <span>🏷️ ${f.airline}${f.flight_number ? ' ' + f.flight_number : ''}</span>
            ${f.departure_time ? `<span>🕐 ${f.departure_time} - ${f.arrival_time}</span>` : ''}
            ${f.notes ? `<span>📝 ${f.notes}</span>` : ''}
          </div>
        </div>
      </div>
    `).join('');
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
        // Show checklist section so items can be added
        document.getElementById('checklistSection').style.display = 'block';
        renderChecklist();
    }

    // Setup checklist add
    document.getElementById('addChecklistBtn').addEventListener('click', addChecklistItem);
    document.getElementById('newChecklistItem').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addChecklistItem();
    });
}

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

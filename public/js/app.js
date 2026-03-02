// --- Main Dashboard (Calendar) ---

let currentMonth, currentYear, tripData = null, currentDayId = null;
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

document.addEventListener('DOMContentLoaded', async () => {
    // Default to May 2026 (trip start)
    currentMonth = 4; // May (0-indexed)
    currentYear = 2026;

    await loadTrip();
    renderCalendar();
    setupEventListeners();
    setupNavScroll();
});

async function loadTrip() {
    try {
        const res = await fetch('/api/trips');
        const trips = await res.json();
        if (trips.length > 0) {
            const tripRes = await fetch(`/api/trips/${trips[0].id}`);
            tripData = await tripRes.json();
            showTripSummary();
        }
    } catch (err) {
        console.error('Failed to load trip:', err);
    }
}

function showTripSummary() {
    if (!tripData) return;
    const summary = document.getElementById('tripSummary');
    const badges = document.getElementById('summaryBadges');
    summary.style.display = 'block';

    const totalDays = tripData.days.length;
    const totalFlights = tripData.days.reduce((a, d) => a + d.flightCount, 0);
    const totalPlaces = tripData.days.reduce((a, d) => a + d.placeCount, 0);
    const totalTasks = tripData.days.reduce((a, d) => a + d.checklistTotal, 0);
    const doneTasks = tripData.days.reduce((a, d) => a + d.checklistDone, 0);

    badges.innerHTML = `
    <span class="badge badge-lavender">📅 ${totalDays} Days Planned</span>
    <span class="badge badge-blue">✈️ ${totalFlights} Flights</span>
    <span class="badge badge-mint">📍 ${totalPlaces} Places</span>
    <span class="badge badge-peach">✅ ${doneTasks}/${totalTasks} Tasks Done</span>
    <span class="badge badge-pink">🗓️ ${tripData.start_date} → ${tripData.end_date}</span>
  `;
}

function renderCalendar() {
    const grid = document.getElementById('calendarGrid');
    const title = document.getElementById('monthTitle');
    title.textContent = `${MONTHS[currentMonth]} ${currentYear}`;

    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    let html = DAYS.map(d => `<div class="calendar-day-header">${d}</div>`).join('');

    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
        html += `<div class="calendar-day empty"></div>`;
    }

    const today = new Date();

    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayInfo = tripData?.days?.find(d => d.date === dateStr);
        const isToday = today.getFullYear() === currentYear && today.getMonth() === currentMonth && today.getDate() === day;

        let classes = 'calendar-day';
        if (dayInfo) classes += ' has-events';
        if (isToday) classes += ' today';

        let dotsHtml = '';
        if (dayInfo) {
            if (dayInfo.flightCount > 0) dotsHtml += '<span class="dot dot-flight"></span>';
            if (dayInfo.placeCount > 0) dotsHtml += '<span class="dot dot-place"></span>';
            if (dayInfo.checklistTotal > 0) dotsHtml += '<span class="dot dot-checklist"></span>';
        }

        html += `
      <div class="${classes}" ${dayInfo ? `data-day-id="${dayInfo.id}"` : ''} data-date="${dateStr}">
        <div class="day-number">${day}</div>
        ${dayInfo ? `<div class="day-title">${dayInfo.title || ''}</div>` : ''}
        ${dotsHtml ? `<div class="day-dots">${dotsHtml}</div>` : ''}
      </div>`;
    }

    grid.innerHTML = html;

    // Attach click handlers
    grid.querySelectorAll('.calendar-day.has-events').forEach(el => {
        el.addEventListener('click', () => openDayModal(el.dataset.dayId));
    });
}

async function openDayModal(dayId) {
    currentDayId = dayId;
    try {
        const res = await fetch(`/api/days/${dayId}`);
        const day = await res.json();

        document.getElementById('modalTitle').textContent = day.title || 'Untitled Day';
        document.getElementById('modalDate').textContent = formatDate(day.date);

        let content = '';

        if (day.notes) {
            content += `<p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 16px; font-style: italic;">${day.notes}</p>`;
        }

        // Flights
        if (day.flights && day.flights.length > 0) {
            content += `<div class="modal-section"><h4>✈️ Flights</h4>`;
            day.flights.forEach(f => {
                content += `<div class="modal-item">
          <div class="item-name">${f.airline} ${f.flight_number}</div>
          <div class="item-detail">${f.departure_city} → ${f.arrival_city} | ${f.departure_time} - ${f.arrival_time}</div>
        </div>`;
            });
            content += `</div>`;
        }

        // Places
        if (day.places && day.places.length > 0) {
            content += `<div class="modal-section"><h4>📍 Places</h4>`;
            day.places.forEach(p => {
                content += `<div class="modal-item">
          <div class="item-name">${p.name}</div>
          <div class="item-detail">${p.location}${p.duration ? ' · ' + p.duration : ''}</div>
        </div>`;
            });
            content += `</div>`;
        }

        // Checklist summary
        if (day.checklist && day.checklist.length > 0) {
            const done = day.checklist.filter(c => c.is_done).length;
            content += `<div class="modal-section"><h4>✅ Checklist</h4>
        <div class="modal-item">
          <div class="item-name">${done} of ${day.checklist.length} tasks completed</div>
          <div style="margin-top: 6px; height: 4px; background: var(--border); border-radius: 2px;">
            <div style="height: 100%; width: ${(done / day.checklist.length * 100)}%; background: var(--mint-deep); border-radius: 2px; transition: width 0.5s ease;"></div>
          </div>
        </div>
      </div>`;
        }

        if (!content) {
            content = `<div class="empty-state"><div class="empty-icon">📝</div><p>No details added yet</p></div>`;
        }

        document.getElementById('modalContent').innerHTML = content;
        document.getElementById('modalViewFull').href = `/day.html?id=${dayId}`;

        const overlay = document.getElementById('dayModal');
        overlay.classList.add('active');
    } catch (err) {
        console.error('Failed to load day:', err);
    }
}

function setupEventListeners() {
    document.getElementById('prevMonth').addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) { currentMonth = 11; currentYear--; }
        renderCalendar();
    });

    document.getElementById('nextMonth').addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) { currentMonth = 0; currentYear++; }
        renderCalendar();
    });

    // Close modal
    document.getElementById('modalClose').addEventListener('click', closeModal);
    document.getElementById('dayModal').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) closeModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });

    // Delete day button — show inline confirmation
    document.getElementById('modalDeleteDay').addEventListener('click', () => {
        document.getElementById('deleteConfirm').style.display = 'block';
    });

    // Confirm delete — yes
    document.getElementById('confirmDeleteYes').addEventListener('click', deleteCurrentDay);

    // Confirm delete — no (cancel)
    document.getElementById('confirmDeleteNo').addEventListener('click', () => {
        document.getElementById('deleteConfirm').style.display = 'none';
    });
}

function closeModal() {
    document.getElementById('dayModal').classList.remove('active');
    document.getElementById('deleteConfirm').style.display = 'none';
    currentDayId = null;
}

async function deleteCurrentDay() {
    if (!currentDayId) return;

    try {
        const res = await fetch(`/api/days/${currentDayId}`, { method: 'DELETE' });
        if (res.ok) {
            closeModal();
            await loadTrip();
            renderCalendar();
            showToast('Day deleted successfully!');
        } else {
            showToast('Failed to delete day', true);
        }
    } catch (err) {
        console.error('Failed to delete day:', err);
        showToast('Error deleting day', true);
    }
}

function showToast(message, isError = false) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = 'toast' + (isError ? ' error' : ' success');
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

function formatDate(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function setupNavScroll() {
    const nav = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        nav.classList.toggle('scrolled', window.scrollY > 10);
    });
}

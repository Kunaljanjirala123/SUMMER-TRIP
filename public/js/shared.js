// --- Shared Itinerary View (Simplified) ---

let tripData = null;
let currentMonth = null;
let currentYear = null;

document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');

  if (!token) { showError(); return; }

  try {
    const res = await fetch(`/api/share/${token}`);
    if (!res.ok) throw new Error('Invalid link');
    tripData = await res.json();
    initSharedView();
  } catch (err) {
    showError();
  }
});

function initSharedView() {
  const { trip, days, permission_level } = tripData;

  document.getElementById('tripName').textContent = trip.name;
  document.getElementById('tripDates').textContent = `${formatDate(trip.start_date)} — ${formatDate(trip.end_date)}`;
  document.title = `${trip.name} — Shared Itinerary`;

  const levelLabel = permission_level === 'complete'
    ? '📋 Trip Overview — Calendar & Destinations'
    : '📅 Trip Calendar';
  document.getElementById('permBanner').textContent = levelLabel;

  // Default to first month of the trip
  const startDate = new Date(trip.start_date + 'T00:00:00');
  currentMonth = startDate.getMonth();
  currentYear = startDate.getFullYear();

  renderSharedView();
}

function renderSharedView() {
  const { trip, days, permission_level } = tripData;
  const container = document.getElementById('sharedContent');

  if (days.length === 0) {
    container.innerHTML = `<div class="empty-state"><div class="empty-icon">📅</div><p>No days in this itinerary yet</p></div>`;
    return;
  }

  // Build day lookup by date
  const daysByDate = {};
  days.forEach(d => { daysByDate[d.date] = d; });

  // Month nav + Calendar
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  let html = `
    <div class="month-nav-shared">
      <button onclick="changeMonth(-1)">← Prev</button>
      <h3>${monthNames[currentMonth]} ${currentYear}</h3>
      <button onclick="changeMonth(1)">Next →</button>
    </div>
  `;

  // Calendar grid
  html += `<div class="shared-calendar">`;
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  weekdays.forEach(w => { html += `<div class="shared-cal-header">${w}</div>`; });

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Empty cells before first day
  for (let i = 0; i < firstDay; i++) {
    html += `<div class="shared-cal-day empty"></div>`;
  }

  // Day cells
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dayInfo = daysByDate[dateStr];
    const hasEvent = !!dayInfo;

    html += `<div class="shared-cal-day ${hasEvent ? 'has-event' : ''}">`;
    html += `<div class="day-num">${d}</div>`;
    if (hasEvent) {
      html += `<div class="day-label">${dayInfo.title || ''}</div>`;
    }
    html += `</div>`;
  }
  html += `</div>`;

  // For "complete" permission: show place names at a glance grouped by day
  if (permission_level === 'complete') {
    const monthDays = days.filter(d => {
      const dt = new Date(d.date + 'T00:00:00');
      return dt.getMonth() === currentMonth && dt.getFullYear() === currentYear;
    });

    if (monthDays.length > 0) {
      html += `<div class="places-glance"><h3>📍 Destinations at a Glance</h3>`;
      monthDays.forEach(day => {
        if (day.places && day.places.length > 0) {
          html += `<div class="day-glance-card">`;
          html += `<h4>${day.title || 'Untitled'}</h4>`;
          html += `<div class="date-label">${formatDateShort(day.date)}</div>`;
          day.places.forEach(p => {
            html += `<span class="place-chip">📍 ${p.name}</span>`;
          });
          html += `</div>`;
        }
      });
      html += `</div>`;
    }
  }

  container.innerHTML = html;
}

function changeMonth(delta) {
  currentMonth += delta;
  if (currentMonth > 11) { currentMonth = 0; currentYear++; }
  if (currentMonth < 0) { currentMonth = 11; currentYear--; }
  renderSharedView();
}

function showError() {
  document.getElementById('tripName').textContent = 'Invalid Link';
  document.getElementById('tripDates').textContent = '';
  document.getElementById('permBanner').style.display = 'none';
  document.getElementById('errorState').style.display = 'block';
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function formatDateShort(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// --- Shared Itinerary View ---

document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (!token) {
        showError();
        return;
    }

    try {
        const res = await fetch(`/api/share/${token}`);
        if (!res.ok) throw new Error('Invalid link');
        const data = await res.json();
        renderSharedView(data);
    } catch (err) {
        showError();
    }
});

function renderSharedView(data) {
    const { trip, days, permission_level } = data;

    document.getElementById('tripName').textContent = trip.name;
    document.getElementById('tripDates').textContent = `${formatDate(trip.start_date)} — ${formatDate(trip.end_date)}`;
    document.title = `${trip.name} — Shared Itinerary`;

    const levelLabel = permission_level === 'complete'
        ? '📋 Complete Itinerary — Flights, Places & Checklists'
        : '📍 Common Itinerary — Places to Visit';
    document.getElementById('permBanner').textContent = levelLabel;

    const container = document.getElementById('sharedContent');

    if (days.length === 0) {
        container.innerHTML = `<div class="empty-state"><div class="empty-icon">📅</div><p>No days in this itinerary yet</p></div>`;
        return;
    }

    container.innerHTML = days.map(day => {
        let html = `
      <div class="card animate-in" style="margin-bottom: 20px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
          <div>
            <h3>${day.title || 'Untitled Day'}</h3>
            <span style="font-size: 0.85rem; color: var(--text-muted);">${formatDate(day.date)}</span>
          </div>
          <span class="badge badge-lavender">${formatDateShort(day.date)}</span>
        </div>
        ${day.notes ? `<p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 16px; font-style: italic;">${day.notes}</p>` : ''}
    `;

        // Flights (complete only)
        if (permission_level === 'complete' && day.flights && day.flights.length > 0) {
            html += `<div style="margin-bottom: 12px;">`;
            day.flights.forEach(f => {
                html += `
          <div class="flight-card" style="margin-bottom: 8px;">
            <div class="flight-icon">✈️</div>
            <div class="flight-info">
              <div class="flight-route">${f.departure_city} → ${f.arrival_city}</div>
              <div class="flight-details">
                <span>🏷️ ${f.airline} ${f.flight_number || ''}</span>
                ${f.departure_time ? `<span>🕐 ${f.departure_time} - ${f.arrival_time}</span>` : ''}
              </div>
            </div>
          </div>
        `;
            });
            html += `</div>`;
        }

        // Places (always shown)
        if (day.places && day.places.length > 0) {
            day.places.forEach(p => {
                html += `
          <div class="place-card" style="margin-bottom: 10px;">
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
        `;
            });
        }

        // Checklist (complete only)
        if (permission_level === 'complete' && day.checklist && day.checklist.length > 0) {
            const done = day.checklist.filter(c => c.is_done).length;
            html += `
        <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border-light);">
          <h4 style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 8px;">✅ Checklist (${done}/${day.checklist.length})</h4>
          <ul class="checklist">
            ${day.checklist.map(c => `
              <li class="checklist-item ${c.is_done ? 'done' : ''}" style="cursor: default;">
                <div class="checklist-checkbox">${c.is_done ? '✓' : ''}</div>
                <span class="checklist-text">${c.text}</span>
              </li>
            `).join('')}
          </ul>
        </div>
      `;
        }

        html += `</div>`;
        return html;
    }).join('');
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

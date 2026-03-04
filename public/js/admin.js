// --- Admin Panel ---

let tripId = null;
let days = [];

document.addEventListener('DOMContentLoaded', async () => {
    await loadTrip();
    setupForms();
    loadShareLinks();
    setupNavScroll();
});

async function loadTrip() {
    try {
        const res = await fetch('/api/trips');
        const trips = await res.json();
        if (trips.length > 0) {
            tripId = trips[0].id;
            const tripRes = await fetch(`/api/trips/${tripId}`);
            const trip = await tripRes.json();
            days = trip.days;
            populateDaySelectors();
        }
    } catch (err) {
        console.error('Failed to load trip:', err);
    }
}

function populateDaySelectors() {
    const selectors = ['daySelector', 'flightDay', 'placeDay', 'rentalCarDay', 'hotelDay'];
    selectors.forEach(id => {
        const sel = document.getElementById(id);
        if (!sel) return;
        const firstOpt = sel.querySelector('option');
        sel.innerHTML = '';
        sel.appendChild(firstOpt);
        days.forEach(d => {
            const opt = document.createElement('option');
            opt.value = d.id;
            opt.textContent = `${d.date} — ${d.title || 'Untitled'}`;
            sel.appendChild(opt);
        });
    });
}

function setupForms() {
    // Add Day
    document.getElementById('addDayForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const date = document.getElementById('newDayDate').value;
        const title = document.getElementById('newDayTitle').value;
        const notes = document.getElementById('newDayNotes').value;

        try {
            const res = await fetch('/api/days', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ trip_id: tripId, date, title, notes })
            });
            if (!res.ok) throw new Error('Failed to add day');
            const newDay = await res.json();
            days.push(newDay);
            days.sort((a, b) => a.date.localeCompare(b.date));
            populateDaySelectors();
            e.target.reset();
            showToast('📅 Day added successfully!', 'success');
        } catch (err) {
            showToast('Failed to add day', 'error');
        }
    });

    // Add Flight
    document.getElementById('addFlightForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            trip_day_id: parseInt(document.getElementById('flightDay').value),
            airline: document.getElementById('flightAirline').value,
            flight_number: document.getElementById('flightNumber').value,
            departure_city: document.getElementById('flightFrom').value,
            arrival_city: document.getElementById('flightTo').value,
            departure_time: document.getElementById('flightDepTime').value,
            arrival_time: document.getElementById('flightArrTime').value,
            notes: document.getElementById('flightNotes').value
        };

        try {
            const res = await fetch('/api/flights', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error('Failed to add flight');
            e.target.reset();
            showToast('✈️ Flight added successfully!', 'success');
            const sel = document.getElementById('daySelector');
            if (sel.value) loadDayDetails(sel.value);
        } catch (err) {
            showToast('Failed to add flight', 'error');
        }
    });

    // Add Place
    document.getElementById('addPlaceForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            trip_day_id: parseInt(document.getElementById('placeDay').value),
            name: document.getElementById('placeName').value,
            location: document.getElementById('placeLocation').value,
            duration: document.getElementById('placeDuration').value,
            map_embed_url: document.getElementById('placeMapUrl').value,
            notes: document.getElementById('placeNotes').value
        };

        try {
            const res = await fetch('/api/places', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error('Failed to add place');
            e.target.reset();
            showToast('📍 Place added successfully!', 'success');
            const sel = document.getElementById('daySelector');
            if (sel.value) loadDayDetails(sel.value);
        } catch (err) {
            showToast('Failed to add place', 'error');
        }
    });

    // Add Rental Car
    document.getElementById('addRentalCarForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            trip_day_id: parseInt(document.getElementById('rentalCarDay').value),
            company: document.getElementById('rentalCarCompany').value,
            confirmation_number: document.getElementById('rentalCarConfirmation').value,
            car_type: document.getElementById('rentalCarType').value,
            pickup_location: document.getElementById('rentalCarPickup').value,
            dropoff_location: document.getElementById('rentalCarDropoff').value,
            pickup_time: document.getElementById('rentalCarPickupTime').value,
            dropoff_time: document.getElementById('rentalCarDropoffTime').value,
            notes: document.getElementById('rentalCarNotes').value
        };

        try {
            const res = await fetch('/api/rentalcars', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error('Failed to add rental car');
            e.target.reset();
            showToast('🚗 Rental car added successfully!', 'success');
            const sel = document.getElementById('daySelector');
            if (sel.value) loadDayDetails(sel.value);
        } catch (err) {
            showToast('Failed to add rental car', 'error');
        }
    });

    // Add Hotel
    document.getElementById('addHotelForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            trip_day_id: parseInt(document.getElementById('hotelDay').value),
            hotel_name: document.getElementById('hotelName').value,
            confirmation_number: document.getElementById('hotelConfirmation').value,
            address: document.getElementById('hotelAddress').value,
            check_in_time: document.getElementById('hotelCheckIn').value,
            check_out_time: document.getElementById('hotelCheckOut').value,
            room_type: document.getElementById('hotelRoomType').value,
            notes: document.getElementById('hotelNotes').value
        };

        try {
            const res = await fetch('/api/hotels', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error('Failed to add hotel');
            e.target.reset();
            showToast('🏨 Hotel added successfully!', 'success');
            const sel = document.getElementById('daySelector');
            if (sel.value) loadDayDetails(sel.value);
        } catch (err) {
            showToast('Failed to add hotel', 'error');
        }
    });

    // Day Selector
    document.getElementById('daySelector').addEventListener('change', (e) => {
        if (e.target.value) {
            loadDayDetails(e.target.value);
        } else {
            document.getElementById('selectedDayInfo').style.display = 'none';
        }
    });

    // Save day title
    document.getElementById('saveDayTitle').addEventListener('click', () => {
        const sel = document.getElementById('daySelector');
        if (sel.value) updateDayTitle(sel.value);
    });

    // Delete day
    document.getElementById('adminDeleteDay').addEventListener('click', () => {
        document.getElementById('adminDeleteConfirm').style.display = 'block';
    });
    document.getElementById('adminConfirmDeleteYes').addEventListener('click', () => {
        const sel = document.getElementById('daySelector');
        if (sel.value) deleteDay(sel.value);
    });
    document.getElementById('adminConfirmDeleteNo').addEventListener('click', () => {
        document.getElementById('adminDeleteConfirm').style.display = 'none';
    });

    // Share buttons
    document.getElementById('shareComplete').addEventListener('click', () => generateShareLink('complete'));
    document.getElementById('shareCommon').addEventListener('click', () => generateShareLink('common'));
}

async function loadDayDetails(dayId) {
    try {
        const res = await fetch(`/api/days/${dayId}`);
        const day = await res.json();

        const container = document.getElementById('selectedDayInfo');
        container.style.display = 'block';
        document.getElementById('editDayTitle').value = day.title || '';
        document.getElementById('editDayDate').textContent = `📅 ${day.date}`;
        document.getElementById('adminDeleteConfirm').style.display = 'none';

        // Flights
        const flightsEl = document.getElementById('dayFlightsList');
        if (day.flights && day.flights.length > 0) {
            flightsEl.innerHTML = day.flights.map(f => `
        <div class="existing-item">
          <span>${f.airline} ${f.flight_number} (${f.departure_city} → ${f.arrival_city})</span>
          <button class="btn btn-danger btn-sm" onclick="deleteFlight(${f.id})">✕</button>
        </div>
      `).join('');
        } else {
            flightsEl.innerHTML = '<div style="color: var(--text-muted); font-size: 0.85rem;">No flights</div>';
        }

        // Places
        const placesEl = document.getElementById('dayPlacesList');
        if (day.places && day.places.length > 0) {
            placesEl.innerHTML = day.places.map(p => `
        <div class="existing-item">
          <span>${p.name}${p.location ? ' — ' + p.location : ''}</span>
          <button class="btn btn-danger btn-sm" onclick="deletePlace(${p.id})">✕</button>
        </div>
      `).join('');
        } else {
            placesEl.innerHTML = '<div style="color: var(--text-muted); font-size: 0.85rem;">No places</div>';
        }

        // Rental Cars
        const carsEl = document.getElementById('dayRentalCarsList');
        if (day.rental_cars && day.rental_cars.length > 0) {
            carsEl.innerHTML = day.rental_cars.map(c => `
        <div class="existing-item">
          <span>${c.company}${c.confirmation_number ? ' — ' + c.confirmation_number : ''}${c.car_type ? ' (' + c.car_type + ')' : ''}</span>
          <button class="btn btn-danger btn-sm" onclick="deleteRentalCar(${c.id})">✕</button>
        </div>
      `).join('');
        } else {
            carsEl.innerHTML = '<div style="color: var(--text-muted); font-size: 0.85rem;">No rental cars</div>';
        }

        // Hotels
        const hotelsEl = document.getElementById('dayHotelsList');
        if (day.hotels && day.hotels.length > 0) {
            hotelsEl.innerHTML = day.hotels.map(h => `
        <div class="existing-item">
          <span>${h.hotel_name}${h.confirmation_number ? ' — ' + h.confirmation_number : ''}</span>
          <button class="btn btn-danger btn-sm" onclick="deleteHotel(${h.id})">✕</button>
        </div>
      `).join('');
        } else {
            hotelsEl.innerHTML = '<div style="color: var(--text-muted); font-size: 0.85rem;">No hotels</div>';
        }
    } catch (err) {
        console.error(err);
    }
}

async function updateDayTitle(dayId) {
    const newTitle = document.getElementById('editDayTitle').value.trim();
    if (!newTitle) {
        showToast('Please enter a title', 'error');
        return;
    }
    try {
        const res = await fetch(`/api/days/${dayId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: newTitle })
        });
        if (!res.ok) throw new Error('Failed to update');
        const idx = days.findIndex(d => d.id == dayId);
        if (idx !== -1) days[idx].title = newTitle;
        populateDaySelectors();
        document.getElementById('daySelector').value = dayId;
        showToast('✏️ Day name updated!', 'success');
    } catch (err) {
        showToast('Failed to update day name', 'error');
    }
}

async function deleteDay(dayId) {
    try {
        const res = await fetch(`/api/days/${dayId}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to delete');
        days = days.filter(d => d.id != dayId);
        populateDaySelectors();
        document.getElementById('selectedDayInfo').style.display = 'none';
        document.getElementById('daySelector').value = '';
        showToast('🗑️ Day deleted successfully!', 'success');
    } catch (err) {
        showToast('Failed to delete day', 'error');
    }
}

async function deleteFlight(id) {
    try {
        await fetch(`/api/flights/${id}`, { method: 'DELETE' });
        showToast('Flight removed', 'success');
        const sel = document.getElementById('daySelector');
        if (sel.value) loadDayDetails(sel.value);
    } catch (err) {
        showToast('Failed to delete flight', 'error');
    }
}

async function deletePlace(id) {
    try {
        await fetch(`/api/places/${id}`, { method: 'DELETE' });
        showToast('Place removed', 'success');
        const sel = document.getElementById('daySelector');
        if (sel.value) loadDayDetails(sel.value);
    } catch (err) {
        showToast('Failed to delete place', 'error');
    }
}

async function deleteRentalCar(id) {
    try {
        await fetch(`/api/rentalcars/${id}`, { method: 'DELETE' });
        showToast('🚗 Rental car removed', 'success');
        const sel = document.getElementById('daySelector');
        if (sel.value) loadDayDetails(sel.value);
    } catch (err) {
        showToast('Failed to delete rental car', 'error');
    }
}

async function deleteHotel(id) {
    try {
        await fetch(`/api/hotels/${id}`, { method: 'DELETE' });
        showToast('🏨 Hotel removed', 'success');
        const sel = document.getElementById('daySelector');
        if (sel.value) loadDayDetails(sel.value);
    } catch (err) {
        showToast('Failed to delete hotel', 'error');
    }
}

async function generateShareLink(level) {
    try {
        const res = await fetch('/api/share', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ trip_id: tripId, permission_level: level })
        });
        const data = await res.json();
        const fullUrl = `${window.location.origin}${data.url}`;

        try {
            await navigator.clipboard.writeText(fullUrl);
            showToast(`🔗 ${level === 'complete' ? 'Complete' : 'Common'} share link copied to clipboard!`, 'success');
        } catch {
            showToast(`🔗 Link generated: ${fullUrl}`, 'success');
        }

        loadShareLinks();
    } catch (err) {
        showToast('Failed to generate link', 'error');
    }
}

async function loadShareLinks() {
    if (!tripId) return;
    try {
        const res = await fetch(`/api/share/links/${tripId}`);
        const links = await res.json();

        const container = document.getElementById('shareLinksListAdmin');
        if (links.length === 0) {
            container.innerHTML = '<div style="color: var(--text-muted); font-size: 0.85rem;">No links generated yet</div>';
            return;
        }

        container.innerHTML = links.map(link => `
      <div class="share-link-item">
        <div>
          <span class="badge ${link.permission_level === 'complete' ? 'badge-lavender' : 'badge-mint'}">
            ${link.permission_level === 'complete' ? '📋 Complete' : '📍 Common'}
          </span>
          <div class="share-link-url">${window.location.origin}/shared.html?token=${link.token}</div>
        </div>
        <div class="share-link-actions">
          <button class="btn btn-soft btn-sm" onclick="copyLink('${link.token}')">📋 Copy</button>
          <button class="btn btn-danger btn-sm" onclick="deleteShareLink(${link.id})">✕</button>
        </div>
      </div>
    `).join('');
    } catch (err) {
        console.error(err);
    }
}

async function copyLink(token) {
    const url = `${window.location.origin}/shared.html?token=${token}`;
    try {
        await navigator.clipboard.writeText(url);
        showToast('📋 Link copied!', 'success');
    } catch {
        showToast('Could not copy — use manual selection', 'error');
    }
}

async function deleteShareLink(id) {
    try {
        await fetch(`/api/share/${id}`, { method: 'DELETE' });
        showToast('🗑️ Link deleted', 'success');
        loadShareLinks();
    } catch (err) {
        showToast('Failed to delete link', 'error');
    }
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

// --- Expense Tracker ---

let tripId = null;
let expenses = [];
let days = [];

document.addEventListener('DOMContentLoaded', async () => {
    await loadTrip();
    await loadExpenses();
    setupForm();
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
            populateDaySelector();
        }
    } catch (err) {
        console.error(err);
    }
}

function populateDaySelector() {
    const sel = document.getElementById('expenseDay');
    days.forEach(d => {
        const opt = document.createElement('option');
        opt.value = d.id;
        opt.textContent = `${d.date} — ${d.title || 'Untitled'}`;
        sel.appendChild(opt);
    });
}

async function loadExpenses() {
    if (!tripId) return;
    try {
        const res = await fetch(`/api/expenses/${tripId}`);
        const data = await res.json();
        expenses = data.expenses;
        renderSummary(data.total);
        renderTable();
        renderCategoryBreakdown();
    } catch (err) {
        console.error(err);
    }
}

function renderSummary(total) {
    document.getElementById('totalAmount').textContent = `$${total.toFixed(2)}`;
    document.getElementById('expenseCount').textContent = expenses.length;
    const avg = expenses.length > 0 ? total / expenses.length : 0;
    document.getElementById('avgExpense').textContent = `$${avg.toFixed(2)}`;
}

function renderTable() {
    const tbody = document.getElementById('expenseTableBody');
    if (expenses.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="empty-state"><div class="empty-icon">💸</div><p>No expenses logged yet</p></td></tr>`;
        return;
    }

    tbody.innerHTML = expenses.map(exp => `
    <tr>
      <td><span class="badge badge-lavender">${getCategoryEmoji(exp.category)} ${exp.category}</span></td>
      <td>${exp.description || '—'}</td>
      <td>${exp.day_title ? `${exp.date} — ${exp.day_title}` : 'General'}</td>
      <td style="font-weight: 600; color: var(--text-primary);">$${exp.amount.toFixed(2)}</td>
      <td>${exp.receipt_image_path ? `<img class="receipt-thumb" src="${exp.receipt_image_path}" onclick="openLightbox('${exp.receipt_image_path}')" alt="Receipt">` : '—'}</td>
      <td><button class="btn btn-danger btn-sm" onclick="deleteExpense(${exp.id})">🗑️</button></td>
    </tr>
  `).join('');
}

function renderCategoryBreakdown() {
    const categories = {};
    expenses.forEach(exp => {
        if (!categories[exp.category]) categories[exp.category] = 0;
        categories[exp.category] += exp.amount;
    });

    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    const container = document.getElementById('categoryBreakdown');

    if (Object.keys(categories).length === 0) {
        container.innerHTML = '<div style="color: var(--text-muted); font-size: 0.9rem; text-align: center; padding: 16px;">No data yet</div>';
        return;
    }

    const colors = {
        'Flight': 'var(--baby-blue)',
        'Hotel': 'var(--lavender)',
        'Food': 'var(--peach)',
        'Transport': 'var(--mint)',
        'Tickets': 'var(--pink)',
        'Shopping': 'var(--lilac)',
        'Car Rental': 'var(--sky)',
        'Other': 'var(--cream)'
    };

    container.innerHTML = Object.entries(categories)
        .sort((a, b) => b[1] - a[1])
        .map(([cat, amount]) => {
            const pct = total > 0 ? (amount / total * 100) : 0;
            return `
        <div style="margin-bottom: 12px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 0.85rem;">
            <span>${getCategoryEmoji(cat)} ${cat}</span>
            <span style="font-weight: 600;">$${amount.toFixed(2)} (${pct.toFixed(1)}%)</span>
          </div>
          <div style="height: 8px; background: var(--border-light); border-radius: 4px; overflow: hidden;">
            <div style="height: 100%; width: ${pct}%; background: ${colors[cat] || 'var(--lavender)'}; border-radius: 4px; transition: width 0.6s ease;"></div>
          </div>
        </div>
      `;
        }).join('');
}

function getCategoryEmoji(cat) {
    const emojis = {
        'Flight': '✈️', 'Hotel': '🏨', 'Food': '🍽️', 'Transport': '🚗',
        'Tickets': '🎫', 'Shopping': '🛍️', 'Car Rental': '🚙', 'Other': '📦'
    };
    return emojis[cat] || '📦';
}

function setupForm() {
    // File upload UX
    const uploadDiv = document.getElementById('receiptUpload');
    const fileInput = document.getElementById('receiptFile');

    uploadDiv.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', () => {
        const file = fileInput.files[0];
        if (file) {
            const preview = document.getElementById('receiptPreview');
            const previewImg = document.getElementById('receiptPreviewImg');

            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    previewImg.src = e.target.result;
                    preview.style.display = 'block';
                };
                reader.readAsDataURL(file);
            }

            uploadDiv.innerHTML = `<span class="upload-icon">📎</span><span>${file.name}</span><input type="file" id="receiptFile" accept="image/*,.pdf">`;
        }
    });

    // Form submit
    document.getElementById('addExpenseForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('trip_id', tripId);
        formData.append('category', document.getElementById('expenseCategory').value);
        formData.append('amount', document.getElementById('expenseAmount').value);
        formData.append('description', document.getElementById('expenseDescription').value);

        const dayVal = document.getElementById('expenseDay').value;
        if (dayVal) formData.append('trip_day_id', dayVal);

        const receiptFile = document.getElementById('receiptFile');
        if (receiptFile.files[0]) {
            formData.append('receipt', receiptFile.files[0]);
        }

        try {
            const res = await fetch('/api/expenses', {
                method: 'POST',
                body: formData
            });
            if (!res.ok) throw new Error('Failed to add expense');

            e.target.reset();
            document.getElementById('receiptPreview').style.display = 'none';

            // Reset upload area
            const uploadDiv = document.getElementById('receiptUpload');
            uploadDiv.innerHTML = `<span class="upload-icon">📷</span><span>Click to upload receipt image</span><input type="file" id="receiptFile" accept="image/*,.pdf">`;

            await loadExpenses();
            showToast('💰 Expense added!', 'success');
        } catch (err) {
            showToast('Failed to add expense', 'error');
        }
    });
}

async function deleteExpense(id) {
    try {
        await fetch(`/api/expenses/item/${id}`, { method: 'DELETE' });
        await loadExpenses();
        showToast('🗑️ Expense removed', 'success');
    } catch (err) {
        showToast('Failed to delete expense', 'error');
    }
}

function openLightbox(src) {
    const lightbox = document.getElementById('lightbox');
    document.getElementById('lightboxImg').src = src;
    lightbox.classList.add('active');

    lightbox.onclick = () => lightbox.classList.remove('active');
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

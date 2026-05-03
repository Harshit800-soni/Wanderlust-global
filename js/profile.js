/* ── PROFILE LOGIC ───────────────────────────────────────────*/

// Expose minimal helpers locally if we don't include all of app.js
const $ = id => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);

// Switch between profile tabs
function switchProfileTab(tabId, btn) {
  // Update buttons
  $$('.profile-tabs__btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  else {
    const defaultBtn = document.querySelector(`.profile-tabs__btn[onclick*="${tabId}"]`);
    if(defaultBtn) defaultBtn.classList.add('active');
  }

  // Update panels
  $$('.profile-section').forEach(sec => sec.classList.remove('active'));
  
  const targetSection = $('tab-' + tabId);
  if (targetSection) targetSection.classList.add('active');
}

// Mobile Nav Toggle
function toggleMobileMenu() {
  const mNav = $('mobile-nav');
  if (mNav) mNav.classList.toggle('open');
}

// Theme Toggle
function toggleTheme() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
  const themeIcon = $('theme-icon');
  const themeLabel = $('theme-label');
  if (themeIcon) themeIcon.textContent = isDark ? '🌙' : '☀️';
  if (themeLabel) themeLabel.textContent = isDark ? 'Dark' : 'Light';
}

// Toast
let _toastTimer;
function showToast(icon, msg) {
  clearTimeout(_toastTimer);
  const toastIcon = $('toast-icon');
  const toastMsg = $('toast-msg');
  if(toastIcon) toastIcon.textContent = icon;
  if(toastMsg) toastMsg.textContent = msg;
  const t = $('toast');
  if(t) {
    t.classList.add('show');
    _toastTimer = setTimeout(() => t.classList.remove('show'), 3500);
  }
}

// Render Bookings from Firebase
async function renderUserBookings() {
  const container = document.querySelector('.trip-grid');
  if (!container) return;

  try {
    const bookings = await window.getUserBookings();
    if (bookings.length === 0) {
      container.innerHTML = `<div class="empty-bookings">
        <p>No trips booked yet. Start your adventure today!</p>
        <a href="index.html#explore" class="btn btn--outline">Explore Destinations</a>
      </div>`;
      return;
    }

    container.innerHTML = bookings.map(b => `
      <div class="trip-card" id="booking-${b.id}">
        <img class="trip-card__img" src="${b.img || 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=600'}" alt="${b.destination}" />
        <div class="trip-card__body">
          <div class="trip-card__status badge badge--success">Confirmed</div>
          <h3 class="trip-card__title">${b.destination}</h3>
          <p class="trip-card__date">${formatBookingDates(b.dates)}</p>
          <p class="trip-card__info">${b.nights} nights · ${b.travellers}</p>
          <p class="trip-card__price">$${b.totalPrice.toLocaleString()}</p>
          <div class="trip-card__actions">
            <button class="btn btn--sm btn--outline" onclick="cancelTrip('${b.id}')">Cancel Trip</button>
            <button class="btn btn--sm btn--ghost" onclick="showToast('ℹ️', 'Contact support to edit booking.')">Edit</button>
          </div>
        </div>
      </div>
    `).join('');
  } catch (e) {
    console.error(e);
    container.innerHTML = '<p>Error loading bookings. Please refresh.</p>';
  }
}

function formatBookingDates(dates) {
  if (!dates || dates.length === 0) return 'TBD';
  if (dates.length === 1) return dates[0];
  return `${dates[0]} to ${dates[1]}`;
}

async function cancelTrip(id) {
  if (!confirm('Are you sure you want to cancel this trip?')) return;
  try {
    await window.cancelBooking(id);
    showToast('🗑️', 'Booking cancelled successfully.');
    renderUserBookings(); // Refresh
  } catch (e) {
    console.error(e);
    showToast('❌', 'Error cancelling booking.');
  }
}

// Expose to window
window.renderUserBookings = renderUserBookings;
window.cancelTrip = cancelTrip;

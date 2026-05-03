/* ── THEME ───────────────────────────────────────────*/
function toggleTheme() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
  const themeIconEl = document.getElementById('theme-icon');
  const themeLabelEl = document.getElementById('theme-label');
  if (themeIconEl) themeIconEl.textContent = isDark ? '🌙' : '☀️';
  if (themeLabelEl) themeLabelEl.textContent = isDark ? 'Dark' : 'Light';
}

/* ── MISC ────────────────────────────────────────────*/
function toggleMobileMenu() {
  const mobileNav = document.getElementById('mobile-nav');
  if (mobileNav) mobileNav.classList.toggle('open');
}

/* ── TOAST ───────────────────────────────────────────*/
let _toastTimer;
function showToast(icon, msg) {
  clearTimeout(_toastTimer);
  const toastIcon = document.getElementById('toast-icon');
  const toastMsg = document.getElementById('toast-msg');
  if (toastIcon) toastIcon.textContent = icon;
  if (toastMsg) toastMsg.textContent  = msg;
  const t = document.getElementById('toast');
  if (t) {
    t.classList.add('show');
    _toastTimer = setTimeout(() => t.classList.remove('show'), 3500);
  }
}

/* ── AUTH LOGIC ──────────────────────────────────────*/
function switchAuthTab(tab) {
  document.querySelectorAll('.tab-pane').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.tab-bar__btn').forEach(el => el.classList.remove('active'));
  
  const targetPane = document.getElementById('atab-' + tab);
  const targetBtn = document.getElementById('tbtn-' + tab);
  
  if (targetPane) targetPane.classList.add('active');
  if (targetBtn) targetBtn.classList.add('active');
}

function handleAuth(type) {
  showToast(
    type === 'login' ? '👋' : '🎉',
    type === 'login' ? 'Welcome back! Redirecting...' : 'Account created! Redirecting...'
  );
  
  // Redirect to profile page after a small delay
  setTimeout(() => {
    window.location.href = 'profile.html';
  }, 1000);
}

// Check URL query parameters on load to switch to correct tab
document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const mode = urlParams.get('mode');
  if (mode === 'register') {
    switchAuthTab('register');
  } else {
    switchAuthTab('login');
  }
});

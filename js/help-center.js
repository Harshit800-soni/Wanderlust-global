/* ── Theme ─────────────────────────────────── */
function toggleTheme() {
  const dark = document.documentElement.getAttribute('data-theme') === 'dark';
  document.documentElement.setAttribute('data-theme', dark ? 'light' : 'dark');
  document.getElementById('theme-icon').textContent  = dark ? '🌙' : '☀️';
  document.getElementById('theme-label').textContent = dark ? 'Dark' : 'Light';
}

/* ── Mobile nav ─────────────────────────────── */
function toggleMobileMenu() {
  document.getElementById('mobile-nav').classList.toggle('open');
}

/* ── Section switching ───────────────────────── */
const SECTIONS = ['getting-started','faq','contact','privacy','terms','refund'];

function showSection(id) {
  // Hide all content sections
  SECTIONS.forEach(s => {
    const el = document.getElementById('sec-' + s);
    if (el) el.classList.remove('active');
    const nav = document.getElementById('nav-' + s);
    if (nav) nav.classList.remove('active');
  });

  // Show target
  const target = document.getElementById('sec-' + id);
  const navBtn = document.getElementById('nav-' + id);
  if (target) target.classList.add('active');
  if (navBtn) navBtn.classList.add('active');

  // Scroll to content top
  document.querySelector('.help-layout').scrollIntoView({ behavior: 'smooth', block: 'start' });

  // Close mobile nav if open
  document.getElementById('side-nav').classList.remove('mobile-open');
}

/* ── FAQ accordion ───────────────────────────── */
function toggleFaq(btn) {
  const item = btn.closest('.faq-item');
  const isOpen = item.classList.contains('open');

  // Close all open items in same group
  btn.closest('.faq-group').querySelectorAll('.faq-item.open').forEach(el => {
    el.classList.remove('open');
  });

  // Toggle current
  if (!isOpen) item.classList.add('open');
}

/* ── Live search (filter FAQ questions) ─────── */
function liveSearch(query) {
  const q = query.toLowerCase().trim();
  if (!q) return;

  // If user types something, show FAQ section
  showSection('faq');

  // Filter FAQ items visibility
  document.querySelectorAll('.faq-item').forEach(item => {
    const text = item.querySelector('.faq-q').textContent.toLowerCase()
                 + item.querySelector('.faq-a').textContent.toLowerCase();
    item.style.display = text.includes(q) ? '' : 'none';
  });

  // Show/hide group titles based on visible items
  document.querySelectorAll('.faq-group').forEach(group => {
    const visible = [...group.querySelectorAll('.faq-item')].some(el => el.style.display !== 'none');
    group.style.display = visible ? '' : 'none';
  });
}

// Reset search when input cleared
document.getElementById('search-input').addEventListener('input', function() {
  if (!this.value.trim()) {
    document.querySelectorAll('.faq-item').forEach(el => el.style.display = '');
    document.querySelectorAll('.faq-group').forEach(el => el.style.display = '');
  }
});

/* ── Contact form submit ─────────────────────── */
async function submitForm(e) {
  e.preventDefault(); // Prevent default reload
  const form = e.target;
  const formData = new FormData(form);

  try {
    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      body: formData
    });

    const data = await response.json();

    if (data.success) {
      showToast('✅', 'Message sent! We\'ll reply within 2 hours.');
      form.reset(); // Clear the form
    } else {
      showToast('❌', 'Failed to send message: ' + data.message);
    }
  } catch (error) {
    showToast('❌', 'Something went wrong!');
  }
}

/* ── Toast ───────────────────────────────────── */
let _tt;
function showToast(icon, msg) {
  clearTimeout(_tt);
  document.getElementById('toast-icon').textContent = icon;
  document.getElementById('toast-msg').textContent  = msg;
  const t = document.getElementById('toast');
  t.classList.add('show');
  _tt = setTimeout(() => t.classList.remove('show'), 3500);
}

/* ── Handle goto param from footer links ─────── */
window.addEventListener('DOMContentLoaded', () => {
  const goto = localStorage.getItem('hc-goto');
  if (goto) { localStorage.removeItem('hc-goto'); showSection(goto); }
});

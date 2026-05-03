/* ── Theme ─────────────────────────────────────── */
function toggleTheme() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
  document.getElementById('theme-icon').textContent  = isDark ? '🌙' : '☀️';
  document.getElementById('theme-label').textContent = isDark ? 'Dark' : 'Light';
}

/* ── Mobile menu ───────────────────────────────── */
function toggleMenu() {
  document.getElementById('mobile-nav').classList.toggle('open');
}

/* ── Star particles ────────────────────────────── */
(function initStars() {
  const c = document.getElementById('stars');
  for (let i = 0; i < 100; i++) {
    const s  = document.createElement('div');
    const sz = Math.random() * 2.2 + 0.4;
    s.className = 'star';
    s.style.cssText = `width:${sz}px;height:${sz}px;left:${Math.random()*100}%;top:${Math.random()*100}%;--d:${2+Math.random()*4}s;--dl:-${Math.random()*5}s`;
    c.appendChild(s);
  }
})();

/* ── Scroll reveal ─────────────────────────────── */
(function initReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          observer.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
})();

/* ── Animated number counters ──────────────────── */
(function initCounters() {
  const fmt = (n, isDecimal) => {
    if (isDecimal) return (n / 10).toFixed(1);
    if (n >= 10000000) return (n / 10000000).toFixed(1) + 'M+';
    if (n >= 1000)    return (n / 1000).toFixed(0) + 'K+';
    return n.toString();
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const el      = e.target;
        const target  = parseInt(el.dataset.count, 10);
        const decimal = el.dataset.decimal === 'true';
        const dur     = 1800;
        const start   = performance.now();

        function tick(now) {
          const progress = Math.min((now - start) / dur, 1);
          const eased    = 1 - Math.pow(1 - progress, 3); // ease-out cubic
          const current  = Math.round(eased * target);
          el.textContent = fmt(current, decimal);
          if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        observer.unobserve(el);
      });
    },
    { threshold: 0.5 }
  );

  document.querySelectorAll('[data-count]').forEach(el => observer.observe(el));
})();

/* ── 2. STATE ─────────────────────────────────────────────*/
const State = {
  filtered:  [...COUNTRIES],
  displayed: 0,
  PER_PAGE:  24,
  activeCont:'',
  activeQ:   '',
  activeBud: '',
  calYear:   new Date().getFullYear(),
  calMonth:  new Date().getMonth(),
  selDates:  [], // Will store [startKey, endKey]
  currentDest: null,
  chatOpen:  false,
};

/* 3. DOM HELPERS */
const $  = id => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);

/* ── 4. STAR PARTICLES ───────────────────────────────────*/
function initStars() {
  const container = $('stars');
  if (!container) return;
  for (let i = 0; i < 130; i++) {
    const s = document.createElement('div');
    s.className = 'star';
    const sz = Math.random() * 2.4 + 0.4;
    s.style.cssText =
      `width:${sz}px;height:${sz}px;` +
      `left:${Math.random()*100}%;top:${Math.random()*100}%;` +
      `--d:${2 + Math.random()*4}s;--dl:-${Math.random()*5}s`;
    container.appendChild(s);
  }
}

/* ── 5. CARD RENDERING ───────────────────────────────────*/
function starStr(r) { return '★'.repeat(r) + '☆'.repeat(5 - r); }
function priceLabel(p) { return p < 500 ? 'Budget' : p < 2000 ? 'Mid-range' : 'Luxury'; }
function priceDot(p)   { return p < 500 ? '🟢' : p < 2000 ? '🔵' : '⭐'; }

function renderCards(reset = false) {
  const grid = $('card-grid');
  if (reset) { grid.innerHTML = ''; State.displayed = 0; }

  const slice = State.filtered.slice(State.displayed, State.displayed + State.PER_PAGE);

  slice.forEach((c, i) => {
    const card = document.createElement('article');
    card.className = 'country-card';
    card.style.animationDelay = `${i * 0.04}s`;
    card.innerHTML = `
      <div class="country-card__img-wrap">
        <img
          class="country-card__img"
          src="${c.img}"
          alt="${c.name} travel destination"
          loading="lazy"
          onerror="this.parentElement.style.background='linear-gradient(135deg,#1c1c22,#2a2a35)';this.style.display='none'"
        />
        <div class="country-card__img-overlay"></div>
        <div class="country-card__badges">
          <span class="badge badge--dark">${priceDot(c.price)} ${priceLabel(c.price)}</span>
          <span class="badge badge--dark">${c.visa}</span>
        </div>
        <div class="country-card__img-footer">
          <span class="country-card__flag">${c.flag}</span>
          <span class="country-card__name-on-img">${c.name}</span>
        </div>
      </div>
      <div class="country-card__body">
        <div class="country-card__continent">${c.continent}</div>
        <p class="country-card__desc">${c.desc}</p>
        <div class="country-card__tags">
          ${c.tags.slice(0,3).map(t => `<span class="country-card__tag">${t}</span>`).join('')}
        </div>
        <div class="country-card__meta">
          <div class="country-card__price">from $${c.price.toLocaleString()}<span> /person</span></div>
          <div class="country-card__stars">${starStr(c.rating)}</div>
        </div>
        <div class="country-card__info-row">🌤 Best: ${c.best}</div>
        <button class="country-card__cta" onclick="openBooking(${COUNTRIES.indexOf(c)})">
          Book This Trip →
        </button>
      </div>`;
    grid.appendChild(card);
  });

  State.displayed += slice.length;

  $('load-more-btn').style.display =
    State.displayed >= State.filtered.length ? 'none' : 'inline-flex';

  $('count-lbl').textContent =
    `Showing ${Math.min(State.displayed, State.filtered.length)} of ${State.filtered.length} destinations`;
}

function loadMore() { renderCards(false); }

/* ── 6. FILTERS & SORT ───────────────────────────────────*/
function applyFilters() {
  const q    = State.activeQ;
  const cont = State.activeCont;
  const bud  = State.activeBud;

  State.filtered = COUNTRIES.filter(c => {
    const mC = !cont || c.continent === cont;
    const mQ = !q || c.name.toLowerCase().includes(q)
                  || c.desc.toLowerCase().includes(q)
                  || c.tags.some(t => t.toLowerCase().includes(q));
    const mB = !bud
             || (bud === 'budget'  && c.price <  500)
             || (bud === 'mid'     && c.price >= 500 && c.price < 2000)
             || (bud === 'luxury'  && c.price >= 2000);
    return mC && mQ && mB;
  });
}

function filterContinent(cont, btn) {
  State.activeCont = cont;
  $$('.filter-bar__btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  $('hero-cont').value = cont;
  applyFilters();
  renderCards(true);
}

function liveSearch(q) {
  State.activeQ = q.toLowerCase();
  applyFilters();
  renderCards(true);
}

function doHeroSearch() {
  State.activeQ   = $('hero-q').value.toLowerCase();
  State.activeBud = $('hero-bud').value;
  State.activeCont= $('hero-cont').value;
  applyFilters();
  renderCards(true);
  $('explore').scrollIntoView({ behavior: 'smooth' });
}

function sortCountries(val) {
  if      (val === 'name')       State.filtered.sort((a,b)=>a.name.localeCompare(b.name));
  else if (val === 'price-asc')  State.filtered.sort((a,b)=>a.price-b.price);
  else if (val === 'price-desc') State.filtered.sort((a,b)=>b.price-a.price);
  else if (val === 'rating')     State.filtered.sort((a,b)=>b.rating-a.rating);
  renderCards(true);
}

/* ── 7. BOOKING MODAL ────────────────────────────────────*/
function openBooking(index) {
  const c = COUNTRIES[index];
  State.currentDest = c;
  State.selDates = [];

  // Hero image
  const heroEl = $('bk-hero');
  heroEl.innerHTML =
    `<img class="modal__hero-img" src="${c.img}" alt="${c.name}" onerror="this.style.display='none'"/>
     <div class="modal__hero-overlay"></div>
     <span class="modal__hero-flag">${c.flag}</span>`;

  $('bk-title').textContent = 'Book: ' + c.name;
  $('bk-sub').textContent   = `${c.continent} · ${c.visa} · Best: ${c.best}`;

  calcPrice();
  renderCalendar();
  $('bk-overlay').classList.add('open');
}

function closeBooking() { $('bk-overlay').classList.remove('open'); }

function closeBkOutside(e) {
  if (e.target === $('bk-overlay')) closeBooking();
}

function calcPrice() {
  const c = State.currentDest;
  if (!c) return;
  const nights  = parseInt($('bk-nights').value) || 7;
  const paxStr  = $('bk-pax').value;
  const pax     = paxStr.includes('1') ? 1
                : paxStr.includes('2') ? 2
                : paxStr.includes('3') ? 4 : 6;
  const base    = c.price * pax;
  const taxes   = Math.round(base * 0.12);
  const grand   = base + taxes;

  $('price-panel').innerHTML = `
    <div class="price-panel__row"><span>Base price (${pax} traveller${pax>1?'s':''})</span><span>$${base.toLocaleString()}</span></div>
    <div class="price-panel__row"><span>Taxes &amp; fees (12%)</span><span>$${taxes.toLocaleString()}</span></div>
    <div class="price-panel__row"><span>Duration</span><span>${nights} nights</span></div>
    <div class="price-panel__row total"><span>Total Estimate</span><span>$${grand.toLocaleString()}</span></div>`;
}

async function submitBooking() {
  const user = window.fbAuth ? window.fbAuth.currentUser : null;
  if (!user) {
    showToast('⚠️', 'Please log in to continue with your booking.');
    // Check if openAuth exists (it's in app.js)
    if (typeof openAuth === 'function') openAuth('login');
    return;
  }

  const name = $('bk-name').value.trim();
  const email = $('bk-email').value.trim();
  const phone = $('bk-phone').value.trim();

  if (!name || !email || !phone) {
    showToast('⚠️', 'Please fill in all personal details.');
    return;
  }

  if (State.selDates.length < 1) {
    showToast('📅', 'Please select at least one travel date.');
    return;
  }

  const c = State.currentDest;
  const paxStr  = $('bk-pax').value;
  const pax     = paxStr.includes('1') ? 1 : paxStr.includes('2') ? 2 : paxStr.includes('3') ? 4 : 6;
  const base    = c.price * pax;
  const taxes   = Math.round(base * 0.12);
  const grand   = base + taxes;

  try {
    const BACKEND_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
      ? 'http://localhost:3000' 
      : 'https://wanderlust-global-backend.onrender.com';
    const response = await fetch(`${BACKEND_URL}/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: grand })
    });
    
    if (!response.ok) throw new Error('Network response was not ok');
    const order = await response.json();

    var options = {
      "key": "rzp_test_SiXQG2dIMSqJTh",
      "amount": order.amount,
      "currency": "USD",
      "name": "Wanderlust Global",
      "description": "Booking for " + State.currentDest.name,
      "image": "img/favicon.ico",
      "order_id": order.id,
      "handler": async function (response) {
        const bookingData = {
          destination: State.currentDest.name,
          img: State.currentDest.img,
          dates: State.selDates,
          travellers: paxStr,
          nights: parseInt($('bk-nights').value) || 7,
          totalPrice: grand,
          paymentId: response.razorpay_payment_id
        };

        try {
          await window.saveBookingToFirebase(bookingData);
          closeBooking();
          showToast('🎉', `Booking confirmed for ${State.currentDest.name}! View it in your profile.`);
        } catch (e) {
          console.error(e);
          showToast('⚠️', 'Payment successful, but failed to save booking record. Please contact support.');
        }
      },
      "prefill": { "name": name, "email": email, "contact": phone },
      "theme": { "color": "#ff6b35" }
    };
    var rzp1 = new Razorpay(options);
    rzp1.on('payment.failed', () => showToast('❌', 'Payment failed. Please try again.'));
    rzp1.open();
  } catch (error) {
    console.error(error);
    showToast('❌', 'Failed to initiate payment. Ensure the backend is running.');
  }
}

/* ── 8. CALENDAR ─────────────────────────────────────────*/
const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];
const WDAYS  = ['Su','Mo','Tu','We','Th','Fr','Sa'];

function renderCalendar() {
  $('cal-lbl').textContent = `${MONTHS[State.calMonth]} ${State.calYear}`;
  const grid  = $('cal-grid');
  const first = new Date(State.calYear, State.calMonth, 1).getDay();
  const total = new Date(State.calYear, State.calMonth + 1, 0).getDate();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let html = WDAYS.map(d => `<div class="calendar__hdr">${d}</div>`).join('');
  for (let i = 0; i < first; i++) html += '<div></div>';

  const start = State.selDates[0] ? keyToDate(State.selDates[0]) : null;
  const end   = State.selDates[1] ? keyToDate(State.selDates[1]) : null;

  for (let d = 1; d <= total; d++) {
    const dateObj = new Date(State.calYear, State.calMonth, d);
    const isPast = dateObj < today;
    const key = `${State.calYear}-${State.calMonth}-${d}`;
    
    const isT = d === today.getDate()
              && State.calMonth === today.getMonth()
              && State.calYear === today.getFullYear();
    
    let classes = 'calendar__day';
    if (isT) classes += ' calendar__day--today';
    if (isPast) classes += ' calendar__day--disabled';
    
    if (State.selDates.includes(key)) {
      classes += ' calendar__day--selected';
    } else if (start && end && dateObj > start && dateObj < end) {
      classes += ' calendar__day--range';
    }

    html += `<div class="${classes}" 
              ${isPast ? '' : `onclick="toggleDate(this,'${key}',${d})"`}>${d}</div>`;
  }
  grid.innerHTML = html;
}

function keyToDate(key) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m, d);
}

function toggleDate(el, key, d) {
  const dateObj = keyToDate(key);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (dateObj < today) {
    showToast('⚠️', 'You cannot select a past date.');
    return;
  }

  if (State.selDates.length === 0 || State.selDates.length === 2) {
    State.selDates = [key];
  } else {
    // Second selection
    const firstDate = keyToDate(State.selDates[0]);
    if (dateObj < firstDate) {
      State.selDates = [key, State.selDates[0]];
    } else if (key === State.selDates[0]) {
      State.selDates = [];
    } else {
      State.selDates.push(key);
    }
  }

  // Update nights if range selected
  if (State.selDates.length === 2) {
    const d1 = keyToDate(State.selDates[0]);
    const d2 = keyToDate(State.selDates[1]);
    const diff = Math.ceil(Math.abs(d2 - d1) / (1000 * 60 * 60 * 24));
    $('bk-nights').value = diff;
    calcPrice();
  }

  renderCalendar();
}

function calPrev() {
  State.calMonth--;
  if (State.calMonth < 0) { State.calMonth = 11; State.calYear--; }
  renderCalendar();
}
function calNext() {
  State.calMonth++;
  if (State.calMonth > 11) { State.calMonth = 0; State.calYear++; }
  renderCalendar();
}

/* ── 9. AUTH MODAL ───────────────────────────────────────*/
function openAuth(tab = 'login') {
  switchAuthTab(tab);
  $('auth-overlay').classList.add('open');
}
function closeAuthOutside(e) {
  if (e.target === $('auth-overlay')) $('auth-overlay').classList.remove('open');
}
function switchAuthTab(t) {
  $$('.tab-pane').forEach(el => el.classList.remove('active'));
  $$('.tab-bar__btn').forEach(el => el.classList.remove('active'));
  $('atab-' + t).classList.add('active');
  $('tbtn-' + t).classList.add('active');
}
function handleAuth(type) {
  $('auth-overlay').classList.remove('open');
  showToast(
    type === 'login' ? '👋' : '🎉',
    type === 'login' ? 'Welcome back! Have a great trip!' : 'Account created! Your adventure begins now!'
  );

  // Update Nav to show Profile
  const navLogin = $('nav-login-btn');
  const navSignup = $('nav-signup-btn');
  const navProfile = $('nav-profile-btn');
  const mobSignup = $('mobile-signup-btn');
  const mobProfile = $('mobile-profile-link');

  if (navLogin) navLogin.style.display = 'none';
  if (navSignup) navSignup.style.display = 'none';
  if (navProfile) navProfile.style.display = 'inline-flex';
  
  if (mobSignup) mobSignup.style.display = 'none';
  if (mobProfile) mobProfile.style.display = 'block';
}

/* ── 10. CHATBOT AI ──────────────────────────────────────*/
const AI_RESPONSES = {
  budget: () => `💰 **Best Budget Destinations (under $500/person)**\n\n🇻🇳 **Vietnam** – $500 · Halong Bay, street food, beaches\n🇰🇭 **Cambodia** – $400 · Angkor Wat for just $37/day\n🇮🇳 **India** – $400 · Taj Mahal, spices, culture\n🇱🇦 **Laos** – $350 · Slow boats on the Mekong\n🇧🇴 **Bolivia** – $400 · Uyuni Salt Flats from $50\n🇦🇱 **Albania** – $400 · Europe's cheapest hidden gem\n🇵🇾 **Paraguay** – $350 · Authentic, untouched South America\n\n✈ **Tips:** Fly Tuesday/Wednesday, book 3 months early, eat local!`,
  europe: () => `🏰 **Top Europe Destinations 2026**\n\n🇵🇹 **Portugal** – $1,000 · Lisbon, Porto, Algarve\n🇭🇺 **Hungary** – $800 · Budapest baths & ruin bars\n🇨🇿 **Czech Republic** – $900 · Prague old town\n🇭🇷 **Croatia** – $1,100 · Dubrovnik & Adriatic islands\n🇸🇮 **Slovenia** – $900 · Lake Bled perfection\n🇷🇴 **Romania** – $600 · Dracula's Transylvania\n🇲🇪 **Montenegro** – $700 · Bay of Kotor hidden gem\n\n📅 Best time: May–September\n🛂 One Schengen visa covers most countries!`,
  beach:  () => `🏖️ **Best Beach Destinations Worldwide**\n\n🇲🇻 **Maldives** – $3,500 · Overwater villas, crystal lagoons\n🇮🇩 **Bali** – $700 · Surf, temples, rice terraces\n🇹🇭 **Thailand** – $600 · Phi Phi, Koh Samui, Phuket\n🇵🇭 **Philippines** – $700 · 7,000+ islands, coral reefs\n🇫🇯 **Fiji** – $1,800 · Coral reefs, Melanesian culture\n🇸🇨 **Seychelles** – $3,500 · Granite boulders & clearest sea\n🇦🇺 **Australia** – $2,200 · Great Barrier Reef & Bondi`,
  honeymoon: () => `💕 **Best Honeymoon Destinations**\n\n🇲🇻 **Maldives** – $3,500 · Overwater bungalows & private beaches\n🇸🇨 **Seychelles** – $3,500 · Most romantic islands on Earth\n🇫🇯 **Fiji** – $1,800 · Private island resorts\n🇮🇹 **Italy** – $1,400 · Amalfi Coast, Venice, Tuscany wine\n🇫🇷 **France** – $1,500 · Paris, Côte d'Azur, Provence\n🇬🇷 **Greece** – $1,100 · Santorini sunsets & Mykonos\n\n💡 Budget tip: Bali ($700) or Sri Lanka ($500) give similar romance!`,
  solo:   () => `🎒 **Best Solo Travel Destinations**\n\n🇯🇵 **Japan** – World's safest country, excellent infrastructure\n🇳🇿 **New Zealand** – Friendly, adventure paradise, easy to navigate\n🇵🇹 **Portugal** – Welcoming locals, great hostels, easy transport\n🇨🇷 **Costa Rica** – Nature + safety, huge solo traveller community\n🇹🇭 **Thailand** – Massive backpacker scene, budget-friendly\n🇮🇸 **Iceland** – One of Earth's safest places, stunning nature\n\n👩 **For solo women:** Japan, Iceland, Portugal and NZ top all safety rankings\n🛡 Always share your itinerary & get travel insurance!`,
  visa:   () => `🛂 **Visa-Free Countries for Indian Passport**\n\n✅ **No visa / free on arrival:**\nMaldives, Nepal, Bhutan, Mauritius, Seychelles, Fiji, Jamaica, Trinidad, Indonesia (on arrival), Thailand (on arrival), Malaysia (on arrival)\n\n📝 **eVisa / easy online visa:**\nUAE, Vietnam, Cambodia, Myanmar, Oman, Jordan, Turkey, Egypt, Sri Lanka, Kenya, Tanzania, Ethiopia\n\n⚠️ Always verify at official embassy websites before booking!`,
  africa: () => `🦁 **Top Africa Safari Destinations**\n\n🇰🇪 **Kenya** – $1,200 · Maasai Mara Migration (Jul–Oct)\n🇹🇿 **Tanzania** – $1,500 · Serengeti + Kilimanjaro + Zanzibar\n🇿🇦 **South Africa** – $1,000 · Big Five + Cape Town\n🇳🇦 **Namibia** – $1,400 · Sossusvlei red dunes (self-drive)\n🇧🇼 **Botswana** – $2,500 · Exclusive Okavango Delta lodges\n🇷🇼 **Rwanda** – $1,500 · Mountain gorilla trekking\n🇲🇬 **Madagascar** – $1,000 · Lemurs, baobabs, unique wildlife\n\n📅 Best: June–October (dry season) for clearest animal sightings`,
  japan:  () => `🇯🇵 **Japan Travel Guide**\n\n🌸 Best time: Mar–May (cherry blossom), Oct–Nov (autumn leaves)\n\n📍 Must-visit:\n• **Tokyo** – Shibuya, Akihabara, Tsukiji fish market\n• **Kyoto** – Fushimi Inari, Arashiyama bamboo, tea ceremony\n• **Osaka** – Dotonbori street food, Universal Studios\n• **Hiroshima** – Peace Memorial Park\n• **Hakone** – Mount Fuji views & onsen hot springs\n\n💰 Budget: $1,800/person for 10 days (mid-range)\n🚅 Get JR Pass for bullet trains — saves ~35%\n🛂 eVisa available online`,
  australia: () => `🇦🇺 **Australia Travel Guide**\n\n📍 Must-do:\n• **Sydney** – Opera House, Bondi Beach, Harbour Bridge\n• **Great Barrier Reef** – World's largest coral system\n• **Uluru** – Sacred red rock in the red centre\n• **Melbourne** – Food scene, coffee culture, laneways art\n• **Daintree Rainforest** – World's oldest tropical forest\n\n💰 Budget: $2,200/person for 2 weeks\n🌡 Best time: September–November, March–May\n✈ Fly into Sydney or Melbourne as hubs\n🐨 Don't miss wildlife parks for kangaroos & koalas!`,
  antarctica: () => `🧊 **Antarctica — The Last Frontier**\n\n📅 Season: November–March (Antarctic summer)\n🛳 How: Expedition cruise from Ushuaia, Argentina (11–21 days)\n💰 Cost: $8,000–$15,000+ per person\n\n🐧 Wildlife: 5 penguin species, orcas, leopard seals, humpback whales\n❄️ Highlights:\n• Deception Island volcanic caldera\n• Drake Passage crossing (bucket list sailing)\n• South Georgia island\n• Aurora Australis (southern lights)\n\n🌡 Temperature: -10°C to +2°C in summer\n⚠️ Only authorized operators allowed — book 12+ months ahead`,
};

async function aiReply(msg) {
  const lc = msg.toLowerCase();

  if (lc.includes('budget') || lc.includes('cheap') || lc.includes('affordable'))
    return AI_RESPONSES.budget();
  if (lc.includes('europe'))      return AI_RESPONSES.europe();
  if (lc.includes('beach') || lc.includes('island')) return AI_RESPONSES.beach();
  if (lc.includes('honeymoon') || lc.includes('couple') || lc.includes('romantic'))
    return AI_RESPONSES.honeymoon();
  if (lc.includes('solo'))        return AI_RESPONSES.solo();
  if (lc.includes('visa'))        return AI_RESPONSES.visa();
  if (lc.includes('africa') || lc.includes('safari')) return AI_RESPONSES.africa();
  if (lc.includes('japan') || lc.includes('tokyo'))   return AI_RESPONSES.japan();
  if (lc.includes('australia'))   return AI_RESPONSES.australia();
  if (lc.includes('antarctica'))  return AI_RESPONSES.antarctica();

  // Check if any country is mentioned
  const country = COUNTRIES.find(c => lc.includes(c.name.toLowerCase().split(' ')[0]));
  if (country) {
    return `${country.flag} **${country.name} Travel Guide**\n\n📌 **Continent:** ${country.continent}\n⭐ **Rating:** ${'★'.repeat(country.rating)}\n💰 **Budget:** from $${country.price.toLocaleString()}/person\n🛂 **Visa:** ${country.visa}\n🌤 **Best time:** ${country.best}\n\n📖 **About:** ${country.desc}\n\n🏷 **Highlights:** ${country.tags.join(', ')}\n\nWould you like a full itinerary for ${country.name}? Just ask! 🗺`;
  }

  // Default
  return `🌍 Great question! I can help you with:\n\n✈ **Trip planning** by country or budget\n🗺 **Itineraries** with days, places and costs\n🛂 **Visa information** for any nationality\n🌤 **Best seasons** for any destination\n💰 **Budget breakdowns** for any trip\n\nTry asking:\n• "Best countries under $500 budget"\n• "Plan 7 days in Japan"\n• "Visa-free for Indians"\n• "Best beach destinations"\n\nWhat would you like to explore? 🌏`;
}

function toggleChat() {
  State.chatOpen = !State.chatOpen;
  $('chat-window').classList.toggle('open', State.chatOpen);
  $('chat-fab').textContent = State.chatOpen ? '✕' : '🌍';
}

function quickChip(text) {
  $('chat-input').value = text;
  sendChat();
}

async function sendChat() {
  const input = $('chat-input');
  const val   = input.value.trim();
  if (!val) return;
  input.value = '';
  addMsg(val, 'user');
  const typing = addTyping();
  const reply  = await aiReply(val);
  setTimeout(() => { typing.remove(); addMsg(reply, 'bot'); }, 900 + Math.random() * 600);
}

function addMsg(text, type) {
  const el = document.createElement('div');
  el.className = `chat-msg chat-msg--${type}`;
  el.innerHTML = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');
  const msgs = $('chat-messages');
  msgs.appendChild(el);
  el.scrollIntoView({ behavior: 'smooth' });
  return el;
}

function addTyping() {
  const el = document.createElement('div');
  el.className = 'chat-msg chat-msg--bot';
  el.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div>';
  $('chat-messages').appendChild(el);
  el.scrollIntoView({ behavior: 'smooth' });
  return el;
}

/* ── 11. THEME ───────────────────────────────────────────*/
function toggleTheme() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
  $('theme-icon').textContent  = isDark ? '🌙' : '☀️';
  $('theme-label').textContent = isDark ? 'Dark' : 'Light';
}

/* ── 12. TOAST ───────────────────────────────────────────*/
let _toastTimer;
function showToast(icon, msg) {
  clearTimeout(_toastTimer);
  $('toast-icon').textContent = icon;
  $('toast-msg').textContent  = msg;
  const t = $('toast');
  t.classList.add('show');
  _toastTimer = setTimeout(() => t.classList.remove('show'), 3500);
}

/* ── 13. MISC ────────────────────────────────────────────*/
function toggleMobileMenu() {
  $('mobile-nav').classList.toggle('open');
}

/* ── 14. INIT ────────────────────────────────────────────*/
document.addEventListener('DOMContentLoaded', () => {
  initStars();
  renderCards(true);

  // Set default dates in booking form
  const today = new Date();
  const fmt   = d => d.toISOString().split('T')[0];
  document.querySelectorAll('input[type="date"]').forEach((inp, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + (i === 0 ? 7 : 14));
    inp.value = fmt(d);
  });

  const urlParams = new URLSearchParams(window.location.search);
  const bookDest = urlParams.get('book');
  if (bookDest) {
    const idx = COUNTRIES.findIndex(c => c.name === bookDest);
    if (idx !== -1) {
      setTimeout(() => {
        openBooking(idx);
        document.getElementById('bk-overlay').scrollIntoView({behavior: 'smooth'});
      }, 100);
    }
  }
});

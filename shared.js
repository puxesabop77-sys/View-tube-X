// ══════════════════════════════════════════════════
// VIEW-TUBE-X  ·  shared.js
// Made in India 🇮🇳 By Sufiyan Absar
// ══════════════════════════════════════════════════

// ── CURSOR ──
function initCursor() {
  const dot = document.createElement('div'); dot.className = 'cursor'; document.body.appendChild(dot);
  const ring = document.createElement('div'); ring.className = 'cursor-ring'; document.body.appendChild(ring);
  let mx=0,my=0,rx=0,ry=0;
  document.addEventListener('mousemove', e => { mx=e.clientX; my=e.clientY; dot.style.left=mx+'px'; dot.style.top=my+'px'; });
  function animRing() { rx+=(mx-rx)*0.12; ry+=(my-ry)*0.12; ring.style.left=rx+'px'; ring.style.top=ry+'px'; requestAnimationFrame(animRing); }
  animRing();
}

// ── PARTICLES ──
function initParticles() {
  const canvas = document.createElement('canvas');
  canvas.className = 'particles-canvas';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  let W = canvas.width = window.innerWidth;
  let H = canvas.height = window.innerHeight;
  window.addEventListener('resize', () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; });
  const particles = Array.from({length: 80}, () => ({
    x: Math.random()*W, y: Math.random()*H,
    vx: (Math.random()-0.5)*0.4, vy: (Math.random()-0.5)*0.4,
    r: Math.random()*1.5+0.5,
    a: Math.random(),
    c: ['#00f5ff','#7b2fff','#ff006e'][Math.floor(Math.random()*3)]
  }));
  function draw() {
    ctx.clearRect(0,0,W,H);
    particles.forEach(p => {
      p.x+=p.vx; p.y+=p.vy;
      if(p.x<0)p.x=W; if(p.x>W)p.x=0;
      if(p.y<0)p.y=H; if(p.y>H)p.y=0;
      ctx.beginPath();
      ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle = p.c;
      ctx.globalAlpha = p.a * 0.6;
      ctx.fill();
    });
    // draw connection lines
    particles.forEach((a,i) => {
      particles.slice(i+1).forEach(b => {
        const d = Math.hypot(a.x-b.x,a.y-b.y);
        if(d<120) {
          ctx.beginPath();
          ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y);
          ctx.strokeStyle = '#00f5ff';
          ctx.globalAlpha = (1-d/120)*0.08;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      });
    });
    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }
  draw();
}

// ── PAGE ENTER ANIMATION ──
function initPageEnter() {
  document.body.classList.add('page-enter');
}

// ── SIDEBAR TOGGLE ──
function toggleSidebar() {
  const sb = document.getElementById('sidebar');
  if (sb) sb.classList.toggle('open');
}

// ── SEARCH ──
function doSearch(e) {
  e?.preventDefault();
  const q = document.getElementById('searchInput')?.value?.trim();
  if (q) VTX.goto(`search.html?q=${encodeURIComponent(q)}`);
}

// ── SHARED NAV HTML ──
function getNavHTML(active = 'home') {
  const items = [
    { id:'home',    href:'index.html',        icon:'fas fa-home',        label:'Home' },
    { id:'shorts',  href:'shorts.html',       icon:'fas fa-film',        label:'Shorts' },
    { id:'subs',    href:'#',                 icon:'fas fa-play-circle', label:'Subscriptions' },
    { id:'divider', divider: true },
    { id:'profile', href:'profile.html',      icon:'fas fa-user',        label:'Your Channel' },
    { id:'history', href:'#',                 icon:'fas fa-history',     label:'History' },
    { id:'later',   href:'#',                 icon:'fas fa-clock',       label:'Watch Later' },
    { id:'liked',   href:'#',                 icon:'fas fa-heart',       label:'Liked Videos' },
    { id:'divider2',divider: true },
    { id:'sec',     section: 'EXPLORE' },
    { id:'trend',   href:'search.html?q=trending india', icon:'fas fa-fire',  label:'Trending' },
    { id:'music',   href:'search.html?q=music', icon:'fas fa-music',    label:'Music' },
    { id:'gaming',  href:'search.html?q=gaming', icon:'fas fa-gamepad', label:'Gaming' },
    { id:'news',    href:'search.html?q=news', icon:'fas fa-newspaper', label:'News' },
    { id:'sports',  href:'search.html?q=sports',icon:'fas fa-futbol',   label:'Sports' },
    { id:'divider3',divider: true },
    { id:'feedback',href:'feedback.html',     icon:'fas fa-comment-dots',label:'Feedback' },
    { id:'upload',  href:'upload.html',       icon:'fas fa-upload',      label:'Upload' },
  ];
  return items.map(it => {
    if (it.divider) return `<div class="nav-divider"></div>`;
    if (it.section) return `<p class="nav-section-title">${it.section}</p>`;
    return `<a href="${it.href}" class="nav-item${it.id===active?' active':''}" onclick="navGoto(event,'${it.href}')">
      <i class="${it.icon}"></i><span>${it.label}</span>
    </a>`;
  }).join('');
}

function navGoto(e, href) {
  e.preventDefault();
  if (href !== '#') VTX.goto(href);
}

// ── HEADER ──
function getHeaderHTML(activeSearch = '') {
  return `
  <div class="header-left">
    <button class="menu-btn" onclick="toggleSidebar()"><i class="fas fa-bars"></i></button>
    <a href="index.html" class="logo" onclick="VTX.goto('index.html');return false">
      <div class="logo-icon"><div class="logo-hex">VX</div></div>
      <span class="logo-text">VIEW·TUBE·X</span>
    </a>
  </div>
  <div class="header-center">
    <form class="search-form" onsubmit="doSearch(event)">
      <input type="text" id="searchInput" class="search-input" placeholder="Search the cosmos..." value="${activeSearch}">
      <button type="submit" class="search-btn"><i class="fas fa-search"></i></button>
    </form>
  </div>
  <div class="header-right">
    <button class="icon-btn" title="Upload" onclick="VTX.goto('upload.html')"><i class="fas fa-video"></i></button>
    <button class="icon-btn" title="Notifications"><i class="fas fa-bell"></i></button>
    <a href="login.html" class="avatar-btn" onclick="VTX.goto('login.html');return false">
      <img src="https://ui-avatars.com/api/?name=VX&background=7b2fff&color=fff&size=36" alt="Account">
    </a>
  </div>`;
}

// ── WATERMARK ──
function getWatermark() {
  return `<div class="watermark">🇮🇳 Made in India · By Sufiyan Absar</div>`;
}

// ── FOOTER ──
function getFooter(noSidebar = false) {
  return `
  <footer class="footer${noSidebar?' no-sidebar':''}">
    <div class="footer-links">
      <a href="#">About</a><a href="#">Press</a><a href="#">Copyright</a>
      <a href="#">Contact</a><a href="#">Creators</a><a href="#">Advertise</a>
      <a href="#">Terms</a><a href="#">Privacy</a><a href="feedback.html">Feedback</a>
    </div>
    <p class="footer-copy">© 2014 Sufiyan Absar. All Rights Reserved.</p>
    <p class="footer-made">🇮🇳 Made in India · By Sufiyan Absar · View-Tube-X</p>
  </footer>`;
}

// ── FLOATING ORBS ──
function getOrbs() {
  return `<div class="float-orb orb1"></div><div class="float-orb orb2"></div><div class="float-orb orb3"></div>`;
}

// ── RENDER VIDEOS INTO GRID ──
function renderVideoCards(items, gridEl) {
  items.forEach((item, idx) => {
    const id = item.id?.videoId || item.id;
    const s  = item.snippet || {};
    const st = item.statistics || {};
    const cd = item.contentDetails || {};
    const dur = VTX.fmtDur(cd.duration);
    const thumb = s.thumbnails?.medium?.url || s.thumbnails?.default?.url || '';
    const chThumb = `https://ui-avatars.com/api/?name=${encodeURIComponent(s.channelTitle||'CH')}&background=0d1520&color=00f5ff&size=34`;

    const card = document.createElement('div');
    card.className = 'video-card';
    card.style.animationDelay = (idx * 0.05) + 's';
    card.onclick = () => VTX.goto(`player.html?v=${id}`);
    card.innerHTML = `
      <div class="video-thumb">
        <img src="${thumb}" alt="${s.title}" loading="lazy" onerror="this.src='https://placehold.co/320x180/0d1520/00f5ff?text=VTX'">
        <div class="video-thumb-overlay"><div class="play-icon-3d"><i class="fas fa-play"></i></div></div>
        ${dur ? `<span class="video-duration">${dur}</span>` : ''}
      </div>
      <div class="video-info">
        <div class="ch-avatar"><img src="${chThumb}" alt="${s.channelTitle}"></div>
        <div class="video-details">
          <p class="video-title">${s.title || ''}</p>
          <div class="video-meta">
            ${s.channelTitle || ''}<br>
            ${st.viewCount ? VTX.fmtViews(st.viewCount) + ' views · ' : ''}${VTX.timeAgo(s.publishedAt)}
          </div>
        </div>
      </div>`;
    gridEl.appendChild(card);
  });
}

// ── INIT COMMON ──
function vtxInit(opts = {}) {
  // Orbs
  document.body.insertAdjacentHTML('afterbegin', getOrbs());
  // BG Grid
  document.body.insertAdjacentHTML('afterbegin', '<div class="bg-grid"></div>');
  // Watermark
  document.body.insertAdjacentHTML('afterbegin', getWatermark());
  // Cursor
  initCursor();
  // Particles
  initParticles();
  // Page enter
  initPageEnter();
  // Header
  const headerEl = document.getElementById('vtx-header');
  if (headerEl) headerEl.innerHTML = getHeaderHTML(opts.search || '');
  // Sidebar
  const sbEl = document.getElementById('vtx-sidebar');
  if (sbEl) sbEl.innerHTML = getNavHTML(opts.active || 'home');
    }
            

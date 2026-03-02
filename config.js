// ╔══════════════════════════════════════╗
// ║   VIEW-TUBE-X  ·  config.js          ║
// ║   Made in India 🇮🇳 By Sufiyan Absar  ║
// ╚══════════════════════════════════════╝

const VTX = {
  API_KEY: 'AIzaSyDTJfnHa3zmUUu__wc2VEL5oRzIgij6kcQ',
  BASE_URL: 'https://www.googleapis.com/youtube/v3',
  APP_NAME: 'View-Tube-X',
  AUTHOR: 'Sufiyan Absar',
  YEAR: '2014',

  // Helper: fetch from YouTube API
  async fetch(endpoint, params = {}) {
    params.key = this.API_KEY;
    const qs = new URLSearchParams(params).toString();
    const res = await fetch(`${this.BASE_URL}/${endpoint}?${qs}`);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  },

  // Format view count
  fmtViews(n) {
    n = parseInt(n) || 0;
    if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B';
    if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
    return n.toString();
  },

  // Format ISO duration
  fmtDur(iso) {
    if (!iso) return '';
    const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!m) return '';
    const h = +m[1] || 0, min = +m[2] || 0, s = +m[3] || 0;
    return h ? `${h}:${String(min).padStart(2,'0')}:${String(s).padStart(2,'0')}` : `${min}:${String(s).padStart(2,'0')}`;
  },

  // Time ago
  timeAgo(dateStr) {
    const d = (Date.now() - new Date(dateStr)) / 1000;
    if (d < 60) return 'Just now';
    if (d < 3600) return `${Math.floor(d/60)}m ago`;
    if (d < 86400) return `${Math.floor(d/3600)}h ago`;
    if (d < 2592000) return `${Math.floor(d/86400)}d ago`;
    if (d < 31536000) return `${Math.floor(d/2592000)}mo ago`;
    return `${Math.floor(d/31536000)}y ago`;
  },

  // Show toast notification
  toast(msg, type = 'info') {
    const el = document.createElement('div');
    el.className = `vtx-toast vtx-toast-${type}`;
    el.innerHTML = msg;
    document.body.appendChild(el);
    requestAnimationFrame(() => el.classList.add('show'));
    setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 400); }, 3000);
  },

  // Navigate with transition
  goto(url) {
    document.body.classList.add('page-exit');
    setTimeout(() => window.location.href = url, 350);
  }
};
      

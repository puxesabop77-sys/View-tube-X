// View-Tube-X - Main Script
// Made in India by Sufiyan Absar

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const main = document.getElementById('mainContent');
  if (sidebar) {
    sidebar.classList.toggle('collapsed');
    sidebar.classList.toggle('open');
  }
}

function formatViews(n) {
  n = parseInt(n) || 0;
  if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B views';
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M views';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K views';
  return n + ' views';
}

function formatDuration(iso) {
  if (!iso) return '';
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return '';
  const h = parseInt(match[1] || 0);
  const m = parseInt(match[2] || 0);
  const s = parseInt(match[3] || 0);
  if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  return `${m}:${String(s).padStart(2,'0')}`;
}

function timeAgo(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = (now - date) / 1000;
  if (diff < 60) return 'Just now';
  if (diff < 3600) return Math.floor(diff/60) + ' minutes ago';
  if (diff < 86400) return Math.floor(diff/3600) + ' hours ago';
  if (diff < 2592000) return Math.floor(diff/86400) + ' days ago';
  if (diff < 31536000) return Math.floor(diff/2592000) + ' months ago';
  return Math.floor(diff/31536000) + ' years ago';
}

function formatNumber(n) {
  n = parseInt(n) || 0;
  if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return n.toString();
}

function renderVideos(items) {
  const grid = document.getElementById('videoGrid');
  items.forEach(item => {
    const id = item.id?.videoId || item.id;
    const s = item.snippet;
    const stats = item.statistics || {};
    const dur = item.contentDetails ? formatDuration(item.contentDetails.duration) : '';
    const thumb = s.thumbnails?.medium?.url || s.thumbnails?.default?.url || '';
    const channelAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(s.channelTitle)}&background=random&size=36`;
    
    const card = document.createElement('div');
    card.className = 'video-card';
    card.onclick = () => window.location.href = `player.html?v=${id}`;
    card.innerHTML = `
      <div class="video-thumbnail">
        <img src="${thumb}" alt="${s.title}" loading="lazy" onerror="this.src='https://via.placeholder.com/320x180/1a1a1a/aaa?text=No+Thumbnail'">
        ${dur ? `<span class="video-duration">${dur}</span>` : ''}
      </div>
      <div class="video-info">
        <div class="channel-avatar">
          <img src="${channelAvatar}" alt="${s.channelTitle}">
        </div>
        <div class="video-details">
          <p class="video-title">${s.title}</p>
          <div class="video-meta">
            <a href="search.html?channel=${encodeURIComponent(s.channelId)}">${s.channelTitle}</a><br>
            ${stats.viewCount ? formatViews(stats.viewCount) + ' • ' : ''}${timeAgo(s.publishedAt)}
          </div>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

function showNotification(msg) {
  const el = document.createElement('div');
  el.className = 'notification';
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3000);
      }
      

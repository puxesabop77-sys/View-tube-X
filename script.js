const CFG = {
  KEY: "AIzaSyDTJfnHa3zmUUu__wc2VEL5oRzIgij6kcQ", // Apni API Key yahan check karein
  BASE: "https://www.googleapis.com/youtube/v3",
  REGION: "IN",
  MAX: 12
};

const S = { mode: "trending", query: "", loading: false, nextToken: "" };

// Utility Functions
const $ = (id) => document.getElementById(id);

// Load Trending Videos
async function loadTrending(append = false) {
  if (S.loading) return;
  S.loading = true;
  const grid = $("video-grid");
  
  try {
    const r = await fetch(`${CFG.BASE}/videos?part=snippet,statistics&chart=mostPopular&regionCode=${CFG.REGION}&maxResults=${CFG.MAX}&key=${CFG.KEY}${S.nextToken ? '&pageToken='+S.nextToken : ''}`);
    const d = await r.json();
    
    if (!append) grid.innerHTML = "";
    d.items.forEach(item => {
      grid.insertAdjacentHTML('beforeend', createVideoCard(item));
    });
    S.nextToken = d.nextPageToken || "";
  } catch (err) {
    console.error("Error loading videos", err);
  } finally {
    S.loading = false;
  }
}

function createVideoCard(item) {
  const s = item.snippet;
  return `
    <div class="card" onclick="location.href='#watch?v=${item.id}'">
      <img src="${s.thumbnails.medium.url}" style="width:100%; border-radius:12px;">
      <div style="padding:10px;">
        <h4 style="margin:5px 0; font-size:0.9rem;">${s.title}</h4>
        <p style="color:#aaa; font-size:0.8rem;">${s.channelTitle}</p>
      </div>
    </div>
  `;
}

// Initial Load
loadTrending();

// Dark Mode Toggle
$("dark-toggle").onclick = () => {
  document.body.classList.toggle("light");
  $("dark-toggle").textContent = document.body.classList.contains("light") ? "☀️" : "🌙";
};

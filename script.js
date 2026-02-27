const CFG = {
    KEY: "AIzaSyDTJfnHa3zmUUu__wc2VEL5oRzIgij6kcQ",
    BASE: "https://www.googleapis.com/youtube/v3",
    REGION: "IN",
    MAX: 12
};

const $ = (id) => document.getElementById(id);

// --- Trending Videos ---
async function loadTrending() {
    const spinner = $("load-spinner");
    if(spinner) spinner.style.display = "block";
    try {
        const r = await fetch(`${CFG.BASE}/videos?part=snippet,statistics&chart=mostPopular&regionCode=${CFG.REGION}&maxResults=${CFG.MAX}&key=${CFG.KEY}`);
        const d = await r.json();
        renderVideos(d.items);
    } catch (e) { console.error("Error:", e); }
    if(spinner) spinner.style.display = "none";
}

// --- Search Function ---
async function doSearch(q) {
    if (!q.trim()) return;
    try {
        const r = await fetch(`${CFG.BASE}/search?part=snippet&type=video&q=${encodeURIComponent(q)}&maxResults=${CFG.MAX}&key=${CFG.KEY}`);
        const d = await r.json();
        renderVideos(d.items);
    } catch (e) { console.error("Search Error:", e); }
}

// --- Render Cards ---
function renderVideos(items) {
    const grid = $("video-grid");
    if(!grid) return;
    grid.innerHTML = "";
    if(!items) return;

    items.forEach(item => {
        const id = item.id.videoId || item.id;
        const s = item.snippet;
        const html = `
            <div class="card" onclick="openWatch('${id}')">
                <img src="${s.thumbnails.high.url || s.thumbnails.medium.url}">
                <div class="card-info">
                    <h4>${s.title}</h4>
                    <p>${s.channelTitle}</p>
                </div>
            </div>`;
        grid.insertAdjacentHTML('beforeend', html);
    });
}

// --- Redirect to Player Page (NEW CHANGE) ---
function openWatch(id) {
    // Ye line ab player.html page par redirect karegi
    window.location.href = `player.html?v=${id}`;
}

// --- Event Initializing ---
function init() {
    if($("search-btn")) {
        $("search-btn").onclick = () => doSearch($("search-input").value);
    }
    if($("search-input")) {
        $("search-input").onkeyup = (e) => { if(e.key === "Enter") $("search-btn").click(); };
    }
    if($("logo-btn")) {
        $("logo-btn").onclick = () => { window.location.href = 'index.html'; };
    }
    if($("dark-toggle")) {
        $("dark-toggle").onclick = () => { document.body.classList.toggle("light"); };
    }
    
    loadTrending();
}

init();

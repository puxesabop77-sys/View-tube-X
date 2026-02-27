const CFG = {
    KEY: "AIzaSyDTJfnHa3zmUUu__wc2VEL5oRzIgij6kcQ",
    BASE: "https://www.googleapis.com/youtube/v3",
    REGION: "IN",
    MAX: 12
};

const $ = (id) => document.getElementById(id);

async function loadTrending() {
    $("load-spinner").style.display = "block";
    try {
        const r = await fetch(`${CFG.BASE}/videos?part=snippet,statistics&chart=mostPopular&regionCode=${CFG.REGION}&maxResults=${CFG.MAX}&key=${CFG.KEY}`);
        const d = await r.json();
        renderVideos(d.items);
    } catch (e) { console.error(e); }
    $("load-spinner").style.display = "none";
}

async function doSearch(q) {
    if (!q.trim()) return;
    try {
        const r = await fetch(`${CFG.BASE}/search?part=snippet&type=video&q=${encodeURIComponent(q)}&maxResults=${CFG.MAX}&key=${CFG.KEY}`);
        const d = await r.json();
        renderVideos(d.items);
    } catch (e) { console.error(e); }
}

function renderVideos(items) {
    const grid = $("video-grid");
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

function openWatch(id) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    $("page-watch").classList.add('active');
    $("player-box").innerHTML = `<iframe width="100%" height="100%" src="https://www.youtube.com/embed/${id}?autoplay=1" frameborder="0" allowfullscreen></iframe>`;
    window.scrollTo(0,0);
}

// Initializing Events
$("search-btn").onclick = () => doSearch($("search-input").value);
$("search-input").onkeyup = (e) => { if(e.key === "Enter") $("search-btn").click(); };
$("logo-btn").onclick = () => { 
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    $("page-home").classList.add('active');
    loadTrending(); 
};

loadTrending();
  

const CFG = {
    KEY: "AIzaSyDTJfnHa3zmUUu__wc2VEL5oRzIgij6kcQ",
    BASE: "https://www.googleapis.com/youtube/v3",
    MAX: 12
};

const $ = (id) => document.getElementById(id);

async function loadContent() {
    try {
        // Load Recommended Videos
        const vRes = await fetch(`${CFG.BASE}/videos?part=snippet,statistics&chart=mostPopular&regionCode=IN&maxResults=${CFG.MAX}&key=${CFG.KEY}`);
        const vData = await vRes.json();
        renderVideos(vData.items);

        // Load Shorts (Using a specific query for shorts feel)
        const sRes = await fetch(`${CFG.BASE}/search?part=snippet&type=video&q=shorts&maxResults=8&key=${CFG.KEY}`);
        const sData = await sRes.json();
        renderShorts(sData.items);

    } catch (e) { console.error(e); }
}

function renderVideos(items) {
    const grid = $("video-grid");
    grid.innerHTML = items.map(item => `
        <div class="card" onclick="window.location.href='player.html?v=${item.id}'">
            <img src="${item.snippet.thumbnails.high.url}">
            <div class="card-info">
                <h4 style="margin:10px 0 5px; font-size:0.95rem;">${item.snippet.title}</h4>
                <p style="color:#aaa; font-size:0.8rem;">${item.snippet.channelTitle}</p>
            </div>
        </div>
    `).join('');
}

function renderShorts(items) {
    const sGrid = $("shorts-grid");
    sGrid.innerHTML = items.map(item => `
        <div class="short-card" onclick="window.location.href='player.html?v=${item.id.videoId}'">
            <img src="${item.snippet.thumbnails.high.url}">
            <div class="short-title">${item.snippet.title.substring(0, 30)}...</div>
        </div>
    `).join('');
}

// Search Logic
$("search-btn").onclick = () => {
    const q = $("search-input").value;
    if(q) window.location.href = `index.html?q=${encodeURIComponent(q)}`;
};

loadContent();

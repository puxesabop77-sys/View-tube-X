:root {
  --bg: #050505;
  --surface: #121212;
  --border: rgba(255, 255, 255, 0.1);
  --accent: #ffffff;
  --text-primary: #ffffff;
  --text-secondary: #a0a0a0;
  --radius: 8px;
}

body {
  font-family: 'Inter', 'DM Sans', sans-serif;
  background-color: var(--bg);
  color: var(--text-primary);
  margin: 0;
  -webkit-font-smoothing: antialiased;
}

/* Navbar: Super Clean */
#navbar {
  position: sticky;
  top: 0;
  z-index: 1000;
  height: 64px;
  background: rgba(5, 5, 5, 0.8);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  padding: 0 40px;
  justify-content: space-between;
}

.nav-logo {
  font-family: 'Syne', sans-serif;
  font-weight: 800;
  letter-spacing: -1px;
  font-size: 1.4rem;
  text-transform: uppercase;
}

.search-wrap {
  flex: 0 1 500px;
  display: flex;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 4px;
  overflow: hidden;
}

#search-input {
  flex: 1;
  background: transparent;
  border: none;
  color: white;
  padding: 10px 15px;
  outline: none;
  font-size: 0.9rem;
}

.search-btn {
  background: var(--border);
  color: white;
  border: none;
  padding: 0 20px;
  cursor: pointer;
  transition: 0.2s;
}

.search-btn:hover { background: #333; }

/* Grid & Cards */
#video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 30px;
  padding: 40px;
}

.card {
  cursor: pointer;
  transition: transform 0.3s ease;
}

.card:hover { transform: translateY(-5px); }

.card img {
  width: 100%;
  aspect-ratio: 16/9;
  object-fit: cover;
  border-radius: var(--radius);
  background: var(--surface);
}

.card-info h4 {
  margin: 12px 0 6px;
  font-size: 1rem;
  font-weight: 500;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-info p {
  color: var(--text-secondary);
  font-size: 0.85rem;
  margin: 0;
}

/* Buttons */
.nav-btn {
  background: transparent;
  color: var(--text-secondary);
  border: none;
  font-size: 0.85rem;
  font-weight: 500;
  margin-left: 20px;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.nav-btn.active-nav { color: var(--accent); }

footer {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-secondary);
  font-size: 0.8rem;
  border-top: 1px solid var(--border);
  letter-spacing: 1px;
    }

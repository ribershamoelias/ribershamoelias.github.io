// ⚙️ Configuration - Update with your backend URL
const ANALYTICS_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000'
  : 'https://analytics.example.com';

// Load and render links
fetch("links.json")
  .then(res => res.json())
  .then(data => {
    const container = document.getElementById("links");

    data.forEach(link => {
      const a = document.createElement("a");
      a.href = link.url;
      a.className = "link";
      a.innerText = link.title;

      // Track click with backend
      a.addEventListener("click", () => {
        // Send click event to analytics backend
        fetch(`${ANALYTICS_URL}/api/click`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ link: link.title })
        }).catch(err => {
          console.warn('Analytics unavailable, using localStorage fallback');
        });

        // Local storage fallback for offline mode
        let stats = JSON.parse(localStorage.getItem("stats")) || {};
        stats[link.title] = (stats[link.title] || 0) + 1;
        localStorage.setItem("stats", JSON.stringify(stats));
      });

      container.appendChild(a);
    });
  })
  .catch(err => {
    console.error('Failed to load links:', err);
    document.getElementById("links").innerHTML = '<p style="color: #e74c3c;">Error loading links</p>';
  });

// Display statistics (local + server)
async function showStats() {
  const statsDiv = document.getElementById("stats");
  
  try {
    // Try to load from server
    const response = await fetch(`${ANALYTICS_URL}/api/stats`);
    const serverStats = await response.json();
    
    const localStats = JSON.parse(localStorage.getItem("stats")) || {};
    
    const statsText = `📊 BACKEND STATS:\n${JSON.stringify(serverStats, null, 2)}\n\n` +
                     `📱 LOCAL STATS (Fallback):\n${JSON.stringify(localStats, null, 2)}`;
    statsDiv.innerText = statsText;
  } catch (err) {
    // Fallback to local storage only
    const stats = JSON.parse(localStorage.getItem("stats")) || {};
    statsDiv.innerText = "⚠️ Analytics server unavailable\n\n" +
                        "📱 LOCAL STATS:\n" +
                        JSON.stringify(stats, null, 2);
  }
}
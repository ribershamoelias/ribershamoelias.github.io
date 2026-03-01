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
      container.appendChild(a);
    });
  })
  .catch(err => {
    console.error('Failed to load links:', err);
    document.getElementById("links").innerHTML = '<p style="color: #e74c3c;">Error loading links</p>';
  });

// link page script
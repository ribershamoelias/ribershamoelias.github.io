async function loadLinks() {
    try {
        const response = await fetch('links.json');
        const links = await response.json();

        const container = document.getElementById('links-container');

        links.forEach(link => {
            const card = document.createElement('a');
            card.className = 'link-card';
            card.href = link.url;
            card.target = "_blank";
            card.rel = "noopener";

            card.innerHTML = `
                <span class="label">External</span>
                <h2>${link.title}</h2>
                <p>Open ${link.title}</p>
            `;

            container.appendChild(card);
        });

    } catch (error) {
        console.error("Error loading links:", error);
    }
}

loadLinks();





const canvas = document.getElementById('logicGame');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('start-btn');
const scoreEl = document.getElementById('score');

let score = 0;
let gameActive = false;
let ball = { x: 0, y: 0, dx: 4, dy: 4, radius: 10 };

// Canvas Größe anpassen
function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
}
window.addEventListener('resize', resize);
resize();

function startGame() {
    gameActive = true;
    startBtn.style.display = 'none';
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    animate();
}

// Interaktion
canvas.addEventListener('mousemove', (e) => {
    if (!gameActive) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Kollisionsprüfung Mouse <-> Ball
    const dist = Math.hypot(mouseX - ball.x, mouseY - ball.y);
    if (dist < 30) {
        score++;
        scoreEl.innerText = `Score: ${score}`;
        // Ball wegstoßen (Physik-Simulation)
        ball.dx *= -1.1; 
        ball.dy *= -1.1;
        // Limit speed
        if(Math.abs(ball.dx) > 10) ball.dx = ball.dx > 0 ? 8 : -8;
    }
});

function animate() {
    if (!gameActive) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Ball zeichnen (Apple Blue Dot)
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#0071e3';
    ctx.fill();
    ctx.closePath();

    // Wände abprallen
    if (ball.x + ball.dx > canvas.width - ball.radius || ball.x + ball.dx < ball.radius) ball.dx *= -1;
    if (ball.y + ball.dy > canvas.height - ball.radius || ball.y + ball.dy < ball.radius) ball.dy *= -1;

    ball.x += ball.dx;
    ball.y += ball.dy;

    requestAnimationFrame(animate);
}
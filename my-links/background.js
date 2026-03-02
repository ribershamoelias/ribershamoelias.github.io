/**
 * background.js
 * An interactive entropy field designed with mathematical precision.
 */

const canvas = document.getElementById('logicCanvas');
const ctx = canvas.getContext('2d');

let particles = [];
const mouse = { x: null, y: null, radius: 160 }; // Radius of influence

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    createGrid();
}

class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.baseX = x;
        this.baseY = y;
        // Individual "weight" for organic movement
        this.density = (Math.random() * 30) + 1;
    }

    update() {
        if (mouse.x) {
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < mouse.radius) {
                // Calculation of force based on distance
                const force = (mouse.radius - distance) / mouse.radius;
                const directionX = (dx / distance) * force * this.density;
                const directionY = (dy / distance) * force * this.density;
                
                // Repel effect (Entropy Control)
                this.x -= directionX;
                this.y -= directionY;
            } else {
                // Return to base position with elastic easing
                if (this.x !== this.baseX) {
                    this.x -= (this.x - this.baseX) * 0.08;
                }
                if (this.y !== this.baseY) {
                    this.y -= (this.y - this.baseY) * 0.08;
                }
            }
        }
    }

    draw() {
        ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
        ctx.beginPath();
        // Circular particles feel more "Apple" than rectangles
        ctx.arc(this.x, this.y, 1.2, 0, Math.PI * 2);
        ctx.fill();
    }
}

function createGrid() {
    particles = [];
    // Adaptive gap: denser on mobile for better visibility
    const gap = window.innerWidth < 768 ? 28 : 42;

    for (let y = 0; y < canvas.height; y += gap) {
        for (let x = 0; x < canvas.width; x += gap) {
            particles.push(new Particle(x, y));
        }
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
    }

    requestAnimationFrame(animate);
}

// Global listeners
window.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

// Reset mouse position when it leaves the window
window.addEventListener('mouseout', () => {
    mouse.x = null;
    mouse.y = null;
});

// Touch support for mobile interaction
window.addEventListener('touchmove', e => {
    mouse.x = e.touches[0].clientX;
    mouse.y = e.touches[0].clientY;
});

window.addEventListener('resize', resize);

// System Boot
resize();
animate();






/* ===== MODAL CONTROL ===== */

function openModal(id){
    document.getElementById(id).classList.add("active");
    document.body.style.overflow="hidden";
}

function closeModal(){
    document.querySelectorAll(".modal").forEach(m=>{
        m.classList.remove("active");
    });
    document.body.style.overflow="";
}

/* close on background click */
document.querySelectorAll(".modal").forEach(modal=>{
    modal.addEventListener("click",e=>{
        if(e.target===modal) closeModal();
    });
});

/* ESC closes modal */
document.addEventListener("keydown",e=>{
    if(e.key==="Escape") closeModal();
});
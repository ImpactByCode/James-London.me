const canvas = document.getElementById("rainCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// ===== RAIN CONFIG =====
const drops = [];
const dropCount = 500;

for (let i = 0; i < dropCount; i++) {
    const depth = Math.random(); // 0 = far, 1 = near

    drops.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,

        length: 10 + Math.random() * 20 * depth,
        speed: 3 + Math.random() * 6 * depth,

        opacity: 0.2 + Math.random() * 0.6 * depth,
        thickness: 0.5 + depth * 1.2,

        wind: 0.4 + Math.random() * 0.6,
        depth: depth
    });
}

// ===== DRAW LOOP =====
function drawRain() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drops.forEach(drop => {
        ctx.beginPath();

        // gradient stroke = tapered rain
        const gradient = ctx.createLinearGradient(
            drop.x,
            drop.y,
            drop.x + drop.wind * 2,
            drop.y + drop.length
        );

        gradient.addColorStop(0, `rgba(255,255,255,0)`); // tip fades
        gradient.addColorStop(0.5, `rgba(255,255,255,${drop.opacity})`);
        gradient.addColorStop(1, `rgba(255,255,255,0)`);

        ctx.strokeStyle = gradient;
        ctx.lineWidth = drop.thickness;

        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x + drop.wind * 2, drop.y + drop.length);
        ctx.stroke();

        // movement
        drop.y += drop.speed;
        drop.x += drop.wind;

        // reset
        if (drop.y > canvas.height) {
            drop.y = -20;
            drop.x = Math.random() * canvas.width;
        }
    });

    requestAnimationFrame(drawRain);
}

drawRain();

// ===== RESIZE =====
window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

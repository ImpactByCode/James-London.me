const canvas = document.getElementById("rainCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// ===== CONFIG =====
const drops = [];
const dropCount = 600;

for (let i = 0; i < dropCount; i++) {
    const depth = Math.random();

    drops.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,

        speed: 4 + depth * 8,
        length: 10 + depth * 20,

        thickness: 0.6 + depth * 1.2,
        opacity: 0.2 + depth * 0.6,

        wind: 0.4 + Math.random() * 0.6
    });
}

// ===== DRAW LOOP =====
function drawRain() {
    // ✅ HARD CLEAR (NO BLUR)
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drops.forEach(drop => {
        ctx.beginPath();

        // ✅ tapered gradient (real streak look)
        const gradient = ctx.createLinearGradient(
            drop.x,
            drop.y,
            drop.x + drop.wind * 2,
            drop.y + drop.length
        );

        gradient.addColorStop(0, `rgba(255,255,255,0)`);
        gradient.addColorStop(0.4, `rgba(255,255,255,${drop.opacity})`);
        gradient.addColorStop(1, `rgba(255,255,255,0)`);

        ctx.strokeStyle = gradient;
        ctx.lineWidth = drop.thickness;

        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x + drop.wind * 2, drop.y + drop.length);
        ctx.stroke();

        // ✅ controlled motion (no smear needed)
        drop.y += drop.speed;
        drop.x += drop.wind;

        // ✅ reset
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

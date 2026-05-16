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

        speed: 4 + depth * 10,
        length: 10 + depth * 25,

        thickness: 0.5 + depth * 1.5,
        opacity: 0.15 + depth * 0.7,

        wind: 0.3 + Math.random() * 0.5,

        // ✅ TRAIL MEMORY
        trail: []
    });
}

// ===== DRAW LOOP =====
function drawRain() {
    // IMPORTANT: semi-clear = motion blur effect
    ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drops.forEach(drop => {
        // store trail
        drop.trail.push({ x: drop.x, y: drop.y });

        if (drop.trail.length > 5) {
            drop.trail.shift();
        }

        for (let i = 0; i < drop.trail.length; i++) {
            const t = drop.trail[i];
            const alpha = (i / drop.trail.length) * drop.opacity;

            ctx.beginPath();

            ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
            ctx.lineWidth = drop.thickness;

            ctx.moveTo(t.x, t.y);
            ctx.lineTo(
                t.x + drop.wind * 2,
                t.y + drop.length
            );

            ctx.stroke();
        }

        // ✅ GRAVITY ACCELERATION
        drop.speed += 0.05;
        drop.y += drop.speed;
        drop.x += drop.wind;

        // reset
        if (drop.y > canvas.height) {
            drop.y = -20;
            drop.x = Math.random() * canvas.width;
            drop.speed = 4 + drop.opacity * 10;
            drop.trail = [];
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

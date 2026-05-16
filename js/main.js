// ===== SETUP =====
const canvas = document.getElementById("rainCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// ===== RAIN SYSTEM =====
const rainDrops = [];
const dropCount = 400;

for (let i = 0; i < dropCount; i++) {
    rainDrops.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        len: Math.random() * 20 + 10,
        speed: Math.random() * 6 + 4,
        opacity: Math.random() * 0.5 + 0.2
    });
}

function drawRain() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.lineWidth = 1;

    rainDrops.forEach(drop => {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(255,255,255,${drop.opacity})`;

        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x + 2, drop.y + drop.len);

        ctx.stroke();

        drop.y += drop.speed;
        drop.x += 0.5;

        if (drop.y > canvas.height) {
            drop.y = -20;
            drop.x = Math.random() * canvas.width;
        }
    });

    requestAnimationFrame(drawRain);
}

drawRain();

// ===== PARALLAX =====
const bg = document.querySelector(".background");

document.addEventListener("mousemove", (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 10;
    const y = (e.clientY / window.innerHeight - 0.5) * 10;

    bg.style.transform = `scale(1.05) translate(${x}px, ${y}px)`;
});

// ===== RESIZE =====
window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

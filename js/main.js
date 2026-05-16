// ========================// =================EventListener("click", () => {
  console.log("INITIATE PROTOCOL TRIGGERED");
});

// ========================
// RAIN ENGINE
// ========================
const canvas = document.getElementById("rain");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let rain = [];

// create drops
for (let i = 0; i < 200; i++) {
  rain.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    length: Math.random() * 10,
    speed: Math.random() * 4 + 2
  });
}

function drawRain() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "rgba(174,194,224,0.6)";
  ctx.lineWidth = 1;

  ctx.beginPath();
  rain.forEach(drop => {
    ctx.moveTo(drop.x, drop.y);
    ctx.lineTo(drop.x, drop.y + drop.length);
  });
  ctx.stroke();
}

function updateRain() {
  rain.forEach(drop => {
    drop.y += drop.speed;

    if (drop.y > canvas.height) {
      drop.y = -20;
      drop.x = Math.random() * canvas.width;
    }
  });
}

function animateRain() {
  drawRain();
  updateRain();
  requestAnimationFrame(animateRain);
}

animateRain();

// ========================
// PARALLAX
// ========================
document.addEventListener("mousemove", (e) => {
  let x = (e.clientX / window.innerWidth - 0.5) * 10;
  let y = (e.clientY / window.innerHeight - 0.5) * 10;

  document.querySelector(".hero").style.transform =
    `translate(${x}px, ${y}px)`;
});

// CTA CLICK
// ========================

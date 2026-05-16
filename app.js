// ===== THREE SETUP =====
const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1,1,1,-1,0,1);

const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById("webgl")
});
renderer.setSize(window.innerWidth, window.innerHeight);

// ===== TEXTURES =====
const loader = new THREE.TextureLoader();

const bgTexture = loader.load("assets/tulsa.jpg");
const phoenixTexture = loader.load("assets/phoenix.png");

// ===== DROPLETS =====
const droplets = [];
const maxDrops = 150;

class Droplet {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vy = Math.random() * 1 + 1;
    this.vx = 0;
    this.radius = Math.random() * 0.01 + 0.01;
    this.life = 1;
  }

  update() {
    this.vy += 0.02;
    this.y += this.vy * 0.002;
    this.x += this.vx * 0.002;

    this.vx *= 0.98;
    this.life -= 0.002;

    // merge
    droplets.forEach(o => {
      if (o === this) return;
      const dx = this.x - o.x;
      const dy = this.y - o.y;
      if (Math.hypot(dx, dy) < this.radius + o.radius) {
        this.radius += o.radius * 0.2;
        o.life = 0;
      }
    });
  }
}

// spawn
function spawnRain() {
  if (droplets.length < maxDrops && Math.random() < 0.7) {
    droplets.push(new Droplet(Math.random(), 0));
  }
}

// ===== SHADER DATA =====
const dropData = new Float32Array(600);

const uniforms = {
  resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
  background: { value: bgTexture },
  phoenix: { value: phoenixTexture },
  droplets: { value: dropData }
};

// ===== SHADER =====
const material = new THREE.ShaderMaterial({
  uniforms,
  fragmentShader: `
    uniform vec2 resolution;
    uniform sampler2D background;
    uniform sampler2D phoenix;
    uniform float droplets[600];

    void main() {
      vec2 uv = gl_FragCoord.xy / resolution;
      vec2 distortion = vec2(0.0);

      for (int i = 0; i < 150; i++) {
        float x = droplets[i*4];
        float y = droplets[i*4+1];
        float r = droplets[i*4+2];

        vec2 pos = vec2(x, y);
        float d = distance(uv, pos);

        if (d < r) {
          float strength = (r - d) / r;
          distortion += normalize(uv - pos) * strength * 0.03;
        }
      }

      vec2 uv2 = uv + distortion;

      vec4 bg = texture2D(background, uv2);
      vec4 ph = texture2D(phoenix, uv2);

      float glow = length(ph.rgb) * 2.0;

      vec3 color = bg.rgb + glow * vec3(1.0,0.85,0.4);
      color += length(distortion) * 5.0;

      gl_FragColor = vec4(color, 1.0);
    }
  `
});

const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2,2), material);
scene.add(mesh);

// ===== INTERACTION =====
document.addEventListener('mousemove', e => {
  droplets.forEach(d => {
    const dx = d.x - e.clientX/window.innerWidth;
    const dy = d.y - e.clientY/window.innerHeight;

    if (Math.hypot(dx,dy) < 0.1) {
      d.vx += dx * 0.5;
      d.vy += dy * 0.5;
    }
  });
});

// ===== UPDATE =====
function updateDrops() {
  spawnRain();

  droplets.forEach(d => d.update());

  for (let i = droplets.length-1; i >=0; i--) {
    if (droplets[i].life <= 0) droplets.splice(i,1);
  }

  for (let i = 0; i < 150; i++) {
    if (droplets[i]) {
      dropData[i*4] = droplets[i].x;
      dropData[i*4+1] = droplets[i].y;
      dropData[i*4+2] = droplets[i].radius;
    } else {
      dropData[i*4] = -10;
    }
  }
}

// ===== HUD FLOAT =====
const panels = document.querySelectorAll('.panel');

document.addEventListener('mousemove', e => {
  const x = (e.clientX / window.innerWidth - 0.5) * 20;
  const y = (e.clientY / window.innerHeight - 0.5) * 20;

  panels.forEach((p, i) => {
    const depth = (i + 1) * 0.5;
    p.style.transform = `translate(${x*depth}px, ${y*depth}px)`;
  });
});

// ===== LOOP =====
function animate() {
  updateDrops();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();

console.log("NEW SHADER BUILD RUNNING ✅");

// ===== SCENE =====
const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1,1,1,-1,0,1);

const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById("webgl"),
  antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);

// ===== TEXTURES =====
const loader = new THREE.TextureLoader();

const bgTexture = loader.load("assets/tulsa.jpg");
const phoenixTexture = loader.load("assets/phoenix.png");

// ===== MOUSE PARALLAX =====
let mouseX = 0;
let mouseY = 0;

document.addEventListener("mousemove", (e) => {
  mouseX = (e.clientX / window.innerWidth - 0.5);
  mouseY = (e.clientY / window.innerHeight - 0.5);
});

// ===== DROPLETS =====
const droplets = [];
const maxDrops = 50;

class Droplet {
  constructor(x, y, layer = 1) {
    this.x = x;
    this.y = y;
    this.layer = layer;

    this.vy = 0.001 + Math.random() * 0.002;
    this.vx = (Math.random() - 0.5) * 0.0005;

    this.radius = layer === 1
      ? Math.random() * 0.01 + 0.004
      : Math.random() * 0.004 + 0.002;

    this.trail = [];
    this.maxTrail = layer === 1 ? 10 : 5;

    this.life = 1;
  }

  update() {
    this.vy += 0.002;
    this.vy *= 0.993;

    this.x += this.vx;
    this.y += this.vy;

    if (Math.random() < 0.0015) {
      this.vy += 0.04;
    }

    this.vx *= 0.98;

    // ✅ trail memory
    this.trail.push({ x: this.x, y: this.y });

    if (this.trail.length > this.maxTrail) {
      this.trail.shift();
    }

    this.life -= 0.0012;
  }
}

// ===== SPAWN =====
function spawnRain() {
  if (droplets.length < maxDrops && Math.random() < 0.25) {
    const layer = Math.random() < 0.6 ? 1 : 0;
    droplets.push(new Droplet(Math.random(), 0, layer));
  }
}

// ===== SHADER DATA =====
const dropData = new Float32Array(400);

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
    uniform float droplets[400];

    void main() {
      vec2 uv = gl_FragCoord.xy / resolution;

      vec2 distortion = vec2(0.0);

      for (int i = 0; i < 100; i++) {
        float x = droplets[i*4];
        float y = droplets[i*4+1];
        float r = droplets[i*4+2];
        float layer = droplets[i*4+3];

        vec2 pos = vec2(x, y);
        float d = distance(uv, pos);

        if (d < r) {
          float strength = (r - d) / r;
          float depth = mix(0.4, 1.0, layer);

          distortion += vec2(
            (uv.x - pos.x) * 0.02 * depth,
            strength * 0.07 * depth
          );
        }
      }

      vec2 uv2 = uv + distortion;

      vec4 bg = texture2D(background, uv2);
      vec4 ph = texture2D(phoenix, uv2);

      // ✅ subtle phoenix (CORRECTED)
      float phLight = dot(ph.rgb, vec3(0.2126,0.7152,0.0722));
      phLight *= 0.18;

      float mask = smoothstep(0.01, 0.08, length(distortion));

      vec3 gold = vec3(1.0, 0.82, 0.45);

      vec3 color = bg.rgb;

      // ONLY through water
      color += gold * phLight * mask;

      // subtle water highlights
      color += length(distortion) * 0.6;

      // micro grain
      float grain = fract(sin(dot(uv * 900.0, vec2(12.9,78.2))) * 43758.5);
      color += (grain - 0.5) * 0.008;

      gl_FragColor = vec4(color, 1.0);
    }
  `
});

const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2,2), material);
scene.add(mesh);

// ===== UPDATE =====
function updateDrops() {

  spawnRain();

  droplets.forEach(d => d.update());

  for (let i = droplets.length-1; i >= 0; i--) {
    if (droplets[i].life <= 0) droplets.splice(i,1);
  }

  let index = 0;

  droplets.forEach(d => {
    d.trail.forEach(t => {
      if (index < 100) {
        dropData[index*4] = t.x;
        dropData[index*4+1] = t.y;
        dropData[index*4+2] = d.radius * 0.8;
        dropData[index*4+3] = d.layer;
        index++;
      }
    });
  });

  for (let i = index; i < 100; i++) {
    dropData[i*4] = -10;
  }
}

// ===== LOOP =====
function animate() {

  updateDrops();

  // ✅ PARALLAX
  scene.position.x = mouseX * 0.03;
  scene.position.y = -mouseY * 0.03;

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();

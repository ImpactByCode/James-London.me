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
const maxDrops = 60; // ✅ reduced for realism

class Droplet {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vy = 0.002;
    this.vx = 0;
    this.radius = Math.random() * 0.008 + 0.006;
    this.life = 1;
  }

  update() {
    // ✅ slow cinematic gravity
    this.vy += 0.003 + Math.random() * 0.003;

    // ✅ glass drag (sticky surface)
    this.vy *= 0.992;

    this.vx *= 0.97;

    this.y += this.vy;
    this.x += this.vx;

    // ✅ rare streak event
    if (Math.random() < 0.002) {
      this.vy += 0.05;
    }

    this.life -= 0.0015;
  }
}

// spawn
function spawnRain() {
  if (droplets.length < maxDrops && Math.random() < 0.3) {
    droplets.push(new Droplet(Math.random(), 0));
  }
}

// ===== SHADER DATA =====
const dropData = new Float32Array(240);

const uniforms = {
  resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
  background: { value: bgTexture },
  phoenix: { value: phoenixTexture },
  droplets: { value: dropData }
};

// ===== SHADER (CORRECTED) =====
const material = new THREE.ShaderMaterial({
  uniforms,
  fragmentShader: `
    uniform vec2 resolution;
    uniform sampler2D background;
    uniform sampler2D phoenix;
    uniform float droplets[240];

    void main() {
      vec2 uv = gl_FragCoord.xy / resolution;

      vec2 distortion = vec2(0.0);

      for (int i = 0; i < 60; i++) {
        float x = droplets[i*4];
        float y = droplets[i*4+1];
        float r = droplets[i*4+2];

        vec2 pos = vec2(x, y);
        float d = distance(uv, pos);

        if (d < r) {
          float strength = (r - d) / r;

          vec2 dir = normalize(uv - pos);

          // ✅ vertical stretch (water sliding)
          distortion += vec2(
            dir.x * 0.015,
            strength * 0.06
          );
        }
      }

      vec2 uv2 = uv + distortion;

      vec4 bg = texture2D(background, uv2);
      vec4 ph = texture2D(phoenix, uv2);

      // ✅ PHOENIX FIX (subtle emitter)
      float phLight = dot(ph.rgb, vec3(0.2126, 0.7152, 0.0722));
      phLight *= 0.25;

      float glassMask = clamp(length(distortion) * 6.0, 0.0, 1.0);

      vec3 gold = vec3(1.0, 0.82, 0.45);

      vec3 color = bg.rgb + (gold * phLight * glassMask);

      // ✅ droplet highlight only
      color += length(distortion) * 0.8;

      // ✅ micro grain for realism
      float grain = fract(sin(dot(uv * 800.0, vec2(12.9898,78.233))) * 43758.5453);
      color += (grain - 0.5) * 0.01;

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

  for (let i = droplets.length-1; i >=0; i--) {
    if (droplets[i].life <= 0) droplets.splice(i,1);
  }

  for (let i = 0; i < 60; i++) {
    if (droplets[i]) {
      dropData[i*4] = droplets[i].x;
      dropData[i*4+1] = droplets[i].y;
      dropData[i*4+2] = droplets[i].radius;
    } else {
      dropData[i*4] = -10;
    }
  }
}

// ===== LOOP =====
function animate() {
  updateDrops();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();

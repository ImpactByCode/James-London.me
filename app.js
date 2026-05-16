// ===== SETUP =====
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
const maxDrops = 50;

class Droplet {
  constructor(x, y) {
    this.x = x;
    this.y = y;

    this.vy = 0.001 + Math.random() * 0.002;
    this.vx = (Math.random() - 0.5) * 0.0005;

    this.radius = Math.random() * 0.01 + 0.004;
    this.life = 1;
  }

  update() {
    // slow heavy movement
    this.vy += 0.002;

    // glass drag
    this.vy *= 0.993;

    this.x += this.vx;
    this.y += this.vy;

    // occasional streak drop
    if (Math.random() < 0.0015) {
      this.vy += 0.04;
    }

    // slight horizontal drift
    this.vx *= 0.98;

    this.life -= 0.0012;
  }
}

// ===== SPAWN =====
function spawnRain() {
  if (droplets.length < maxDrops && Math.random() < 0.25) {
    droplets.push(new Droplet(Math.random(), 0));
  }
}

// ===== SHADER DATA =====
const dropData = new Float32Array(200);

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
    uniform float droplets[200];

    void main() {

      vec2 uv = gl_FragCoord.xy / resolution;

      vec2 distortion = vec2(0.0);

      for (int i = 0; i < 50; i++) {

        float x = droplets[i*4];
        float y = droplets[i*4+1];
        float r = droplets[i*4+2];

        vec2 pos = vec2(x, y);

        float d = distance(uv, pos);

        if (d < r) {

          float strength = (r - d) / r;

          // ✅ vertical distortion dominance
          distortion += vec2(
            (uv.x - pos.x) * 0.02,
            strength * 0.07
          );
        }
      }

      vec2 uv2 = uv + distortion;

      vec4 bg = texture2D(background, uv2);
      vec4 ph = texture2D(phoenix, uv2);

      // ✅ subtle phoenix (ambient only)
      float phLight = dot(ph.rgb, vec3(0.2126,0.7152,0.0722));
      phLight *= 0.18;

      float mask = smoothstep(0.01, 0.08, length(distortion));

      vec3 gold = vec3(1.0, 0.82, 0.45);

      vec3 color = bg.rgb;

      // ONLY show through water
      color += gold * phLight * mask;

      // subtle highlight
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

  for (let i = droplets.length-1; i>=0; i--) {
    if (droplets[i].life <= 0) droplets.splice(i,1);
  }

  for (let i = 0; i < 50; i++) {
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

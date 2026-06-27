// --- SOUND SYNTHESIS SYSTEM (Web Audio API) ---
class SoundSystem {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playFlap() {
    if (this.muted) return;
    this.init();
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(160, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(380, this.ctx.currentTime + 0.08);
      
      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);
      
      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch (e) {
      console.warn("Audio failed to play:", e);
    }
  }

  playScore() {
    if (this.muted) return;
    this.init();
    try {
      const now = this.ctx.currentTime;
      const playNote = (freq, start, duration) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.1, start);
        gain.gain.exponentialRampToValueAtTime(0.01, start + duration);
        osc.start(start);
        osc.stop(start + duration);
      };
      playNote(587.33, now, 0.08); // D5
      playNote(880.00, now + 0.08, 0.16); // A5
    } catch (e) {
      console.warn("Audio failed to play:", e);
    }
  }

  playHit() {
    if (this.muted) return;
    this.init();
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(260, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(40, this.ctx.currentTime + 0.35);
      
      gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.35);
      
      osc.start();
      osc.stop(this.ctx.currentTime + 0.35);
    } catch (e) {
      console.warn("Audio failed to play:", e);
    }
  }

  playUnlock() {
    if (this.muted) return;
    this.init();
    try {
      const now = this.ctx.currentTime;
      const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99]; // C4, E4, G4, C5, E5, G5
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);
        gain.gain.setValueAtTime(0.12, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.06 + 0.12);
        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.12);
      });
    } catch (e) {
      console.warn("Audio failed to play:", e);
    }
  }
}

const sound = new SoundSystem();

// --- RETRO SKIN GRID MATRIX ---
// 12x10 grid: 0=transparent, 1=black, 2=yellow, 3=white, 4=orange, 5=wing-white
const retroBirdGrid = [
  [0,0,0,0,1,1,1,1,1,1,0,0],
  [0,0,0,1,2,2,2,2,2,2,1,0],
  [0,0,1,2,2,2,2,2,3,3,1,1],
  [0,1,2,5,5,2,2,3,1,3,1,1],
  [1,2,2,5,5,5,2,2,2,3,1,0],
  [1,2,2,2,5,5,2,2,4,4,4,1],
  [1,2,2,2,2,2,2,4,4,4,4,1],
  [0,1,2,2,2,2,2,2,4,4,1,0],
  [0,0,1,1,2,2,2,2,2,1,0,0],
  [0,0,0,0,1,1,1,1,1,0,0,0]
];

// --- DYNAMIC THEME COLORS FOR CANVAS ---
let themeColors = {
  accentPrimary: '#ff007f',
  accentSecondary: '#00f0ff'
};

function updateThemeColors() {
  // Delay slightly to allow document.body styles to recalculate after class toggle
  setTimeout(() => {
    const bodyStyle = getComputedStyle(document.body);
    themeColors.accentPrimary = bodyStyle.getPropertyValue('--accent-primary').trim() || '#ff007f';
    themeColors.accentSecondary = bodyStyle.getPropertyValue('--accent-secondary').trim() || '#00f0ff';
  }, 50);
}

// --- TELEMETRY STATS & SAVES ---
let stats = {
  highScore: 0,
  totalGames: 0,
  totalPipes: 0,
  totalJumps: 0,
  achievements: {
    firstFlight: false,
    pipeMaster: false,
    neonGod: false,
    hacker: false
  }
};

function loadStats() {
  const saved = localStorage.getItem('cyberflap_save_telemetry');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      stats = { ...stats, ...parsed };
      // Backward compatibility check for achievements nesting
      if (!stats.achievements) stats.achievements = {};
    } catch (e) {
      console.error("Could not load stats:", e);
    }
  }
  updateStatsUI();
  updateAchievementsListUI();
}

function saveStats() {
  localStorage.setItem('cyberflap_save_telemetry', JSON.stringify(stats));
  updateStatsUI();
}

function updateStatsUI() {
  document.getElementById('score-best').textContent = stats.highScore;
  document.getElementById('summary-best').textContent = stats.highScore;
  document.getElementById('stat-total-games').textContent = stats.totalGames;
  document.getElementById('stat-total-pipes').textContent = stats.totalPipes;
  document.getElementById('stat-total-jumps').textContent = stats.totalJumps;
  
  let clearRate = 0;
  if (stats.totalGames > 0) {
    clearRate = Math.round((stats.totalPipes / stats.totalGames) * 10) / 10;
  }
  document.getElementById('stat-accuracy').textContent = clearRate + "/run";
}

function unlockAchievement(id, name) {
  if (stats.achievements[id]) return;
  stats.achievements[id] = true;
  saveStats();
  updateAchievementsListUI();
  sound.playUnlock();

  // Show a beautiful toast notification on current screen overlay
  const toastContainer = document.getElementById('gameover-achievement-unlock');
  if (toastContainer) {
    const toast = document.createElement('div');
    toast.className = 'toast-achievement';
    toast.innerHTML = `
      <div class="toast-ach-badge">✓</div>
      <div class="toast-ach-info">
        <div class="toast-ach-title">ACHIEVEMENT UNLOCKED</div>
        <div class="toast-ach-name">${name}</div>
      </div>
    `;
    toastContainer.appendChild(toast);
  }
}

function updateAchievementsListUI() {
  const achievements = [
    { id: 'firstFlight', domId: 'ach-first-flight', name: 'First Flight' },
    { id: 'pipeMaster', domId: 'ach-pipe-master', name: 'Pipe Wrangler' },
    { id: 'neonGod', domId: 'ach-neon-god', name: 'Aero-deity' },
    { id: 'hacker', domId: 'ach-hacker', name: 'Console Breaker' }
  ];

  achievements.forEach(ach => {
    const element = document.getElementById(ach.domId);
    if (element) {
      if (stats.achievements[ach.id]) {
        element.classList.remove('locked');
        element.classList.add('unlocked');
      } else {
        element.classList.add('locked');
        element.classList.remove('unlocked');
      }
    }
  });
}

// --- TIP ENGINE ---
const tips = [
  "Use the physics sliders dynamically to fine-tune your flight patterns.",
  "Neon orb skins have smooth acceleration physics indicators.",
  "In Retro 8-bit mode, the game scales borders and pipes into pixel grids.",
  "Unlocking achievements gives retro audio-synthesized chimes.",
  "Toggle difficulty presets for instant test adjustments.",
  "Press 'P' on your keyboard to instantly pause simulation and take a breath."
];
let tipIndex = 0;
setInterval(() => {
  tipIndex = (tipIndex + 1) % tips.length;
  document.getElementById('rotating-tips').textContent = tips[tipIndex];
}, 10000);

// --- PHYSICS ENGINE PARAMETERS ---
const physicsPresets = {
  easy: { gravity: 0.25, jump: -5.5, speed: 2.0, gap: 170 },
  normal: { gravity: 0.38, jump: -7.0, speed: 2.6, gap: 140 },
  hard: { gravity: 0.50, jump: -8.0, speed: 3.5, gap: 120 }
};

let currentPhysics = {
  gravity: 0.38,
  jump: -7.0,
  speed: 2.6,
  gap: 140
};

let isHacked = false;

function applyPhysicsPreset(presetName) {
  const preset = physicsPresets[presetName];
  if (!preset) return;
  
  currentPhysics = { ...preset };
  isHacked = false;

  // Update UI Inputs
  document.getElementById('slider-gravity').value = currentPhysics.gravity;
  document.getElementById('val-gravity').textContent = currentPhysics.gravity;

  document.getElementById('slider-jump').value = currentPhysics.jump;
  document.getElementById('val-jump').textContent = currentPhysics.jump;

  document.getElementById('slider-speed').value = currentPhysics.speed;
  document.getElementById('val-speed').textContent = currentPhysics.speed;

  document.getElementById('slider-gap').value = currentPhysics.gap;
  document.getElementById('val-gap').textContent = currentPhysics.gap + "px";

  document.querySelectorAll('.difficulty-presets .preset-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.preset === presetName);
  });
}

function handlePhysicsSliderChange() {
  const gravity = parseFloat(document.getElementById('slider-gravity').value);
  const jump = parseFloat(document.getElementById('slider-jump').value);
  const speed = parseFloat(document.getElementById('slider-speed').value);
  const gap = parseInt(document.getElementById('slider-gap').value);

  currentPhysics = { gravity, jump, speed, gap };
  
  document.getElementById('val-gravity').textContent = gravity;
  document.getElementById('val-jump').textContent = jump.toFixed(1);
  document.getElementById('val-speed').textContent = speed.toFixed(1);
  document.getElementById('val-gap').textContent = gap + "px";

  // Check if physics differ from standard normal
  const standard = physicsPresets.normal;
  const isCustom = gravity !== standard.gravity || 
                   jump !== standard.jump || 
                   speed !== standard.speed || 
                   gap !== standard.gap;
  
  if (isCustom) {
    isHacked = true;
    document.querySelectorAll('.difficulty-presets .preset-btn').forEach(btn => btn.classList.remove('active'));
  }
}

// --- GAME CORE ENGINE ---
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

let gameState = 'START'; // START, PLAYING, PAUSED, GAMEOVER
let gameScore = 0;
let runPipesCleared = 0;
let currentTheme = 'cyberpunk';
let currentSkin = 'neon';

// Entities
let bird = {
  x: 100,
  y: 200,
  radius: 16,
  velocity: 0,
  angle: 0,
  flapFrame: 0
};

let pipes = [];
let particles = [];
let backgrounds = [];
let gameFrame = 0;

// Initialize backgrounds based on current theme
function initParallaxBackground() {
  backgrounds = [];
  const width = canvas.width;
  const height = canvas.height;

  if (currentTheme === 'cyberpunk') {
    // Cyberpunk Stars (Layer 1)
    for (let i = 0; i < 40; i++) {
      backgrounds.push({
        type: 'star',
        x: Math.random() * width,
        y: Math.random() * (height - 120),
        size: Math.random() * 2 + 1,
        speed: Math.random() * 0.1 + 0.05
      });
    }
    // Cyberpunk City Skyline (Layer 2)
    for (let i = 0; i < 8; i++) {
      backgrounds.push({
        type: 'building',
        x: i * 90,
        w: 60 + Math.random() * 40,
        h: 150 + Math.random() * 150,
        speed: 0.4,
        color: `hsl(${260 + Math.random() * 20}, 40%, ${10 + Math.random() * 6}%)`
      });
    }
  } else if (currentTheme === 'retro') {
    // Retro Clouds (Layer 1)
    for (let i = 0; i < 4; i++) {
      backgrounds.push({
        type: 'cloud',
        x: i * 200 + Math.random() * 50,
        y: 40 + Math.random() * 60,
        w: 50 + Math.random() * 30,
        h: 20 + Math.random() * 10,
        speed: 0.15
      });
    }
    // Retro Hills (Layer 2)
    for (let i = 0; i < 5; i++) {
      backgrounds.push({
        type: 'hill',
        x: i * 150,
        w: 160,
        h: 60 + Math.random() * 40,
        speed: 0.5
      });
    }
  } else if (currentTheme === 'forest') {
    // Forest Mountains (Layer 1)
    for (let i = 0; i < 4; i++) {
      backgrounds.push({
        type: 'mountain',
        x: i * 200,
        w: 240,
        h: 120 + Math.random() * 80,
        speed: 0.2
      });
    }
    // Forest Pine Trees (Layer 2)
    for (let i = 0; i < 15; i++) {
      backgrounds.push({
        type: 'tree',
        x: i * 50 + Math.random() * 15,
        h: 80 + Math.random() * 70,
        speed: 0.6
      });
    }
  }
}

// Reset Game State for New Play Session
function resetGame() {
  bird.y = 200;
  bird.velocity = 0;
  bird.angle = 0;
  pipes = [];
  particles = [];
  gameScore = 0;
  runPipesCleared = 0;
  gameFrame = 0;
  document.getElementById('score-current').textContent = 0;
  
  // Clear any temporary toast items in game over overlay
  const toastContainer = document.getElementById('gameover-achievement-unlock');
  if (toastContainer) {
    toastContainer.innerHTML = '';
  }

  // Generate initial couple of pipes
  pipes.push(createPipe(canvas.width + 100));
  pipes.push(createPipe(canvas.width + 380));

  initParallaxBackground();
}

function createPipe(startX) {
  const gap = currentPhysics.gap;
  const minHeight = 60;
  const maxHeight = canvas.height - gap - minHeight - 60; // leave floor room
  const topHeight = Math.floor(Math.random() * (maxHeight - minHeight)) + minHeight;
  
  return {
    x: startX,
    w: 68,
    topHeight: topHeight,
    bottomY: topHeight + gap,
    passed: false
  };
}

// Spark explosion on hits or achievements
function spawnExplosion(x, y, color, count = 20) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 5 + 2;
    particles.push({
      x: x,
      y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: Math.random() * 4 + 2,
      color: color,
      alpha: 1.0,
      decay: Math.random() * 0.04 + 0.02
    });
  }
}

// Trail particles from flapping
function spawnTrail(x, y, color) {
  particles.push({
    x: x - 10,
    y: y + (Math.random() * 8 - 4),
    vx: -currentPhysics.speed * 0.5 - (Math.random() * 1.5),
    vy: Math.random() * 2 - 1,
    size: Math.random() * 5 + 3,
    color: color,
    alpha: 0.8,
    decay: 0.03
  });
}

function handleFlap() {
  if (gameState !== 'PLAYING') return;
  bird.velocity = currentPhysics.jump;
  stats.totalJumps++;
  saveStats();
  sound.playFlap();

  // Splash tail flame / glow particles
  let pColor = '#ff007f';
  if (currentSkin === 'neon') pColor = '#00f0ff';
  if (currentSkin === 'rocket') pColor = '#e67e22';
  if (currentSkin === 'retro') pColor = '#f1c40f';
  if (currentSkin === 'bat') pColor = '#7f8c8d';

  spawnExplosion(bird.x - 12, bird.y, pColor, 6);
}

// --- CANVAS RENDERING AND GAMEPLAY LOOPS ---
function update() {
  if (gameState === 'PLAYING') {
    gameFrame++;
    
    // Bird movement physics
    bird.velocity += currentPhysics.gravity;
    bird.y += bird.velocity;
    
    // Angle interpolation based on velocity
    bird.angle = Math.min(Math.PI / 4, Math.max(-Math.PI / 7, bird.velocity * 0.07));

    // Handle wings flapping animation
    bird.flapFrame = Math.sin(gameFrame * 0.15);

    // Spawn trail
    if (gameFrame % 3 === 0) {
      let tColor = 'rgba(0, 240, 255, 0.4)';
      if (currentSkin === 'rocket') tColor = 'rgba(230, 126, 34, 0.5)';
      if (currentSkin === 'retro') tColor = 'rgba(241, 196, 15, 0.5)';
      if (currentSkin === 'bat') tColor = 'rgba(127, 140, 141, 0.5)';
      spawnTrail(bird.x, bird.y, tColor);
    }

    // Floor / Ceiling collisions
    const floorLimit = canvas.height - 40;
    if (bird.y - bird.radius <= 0) {
      bird.y = bird.radius;
      bird.velocity = 0.5; // push down
    }
    if (bird.y + bird.radius >= floorLimit) {
      bird.y = floorLimit - bird.radius;
      triggerGameOver();
    }

    // Parallax backgrounds update
    backgrounds.forEach(bg => {
      bg.x -= bg.speed;
      if (bg.type === 'star' && bg.x < 0) bg.x = canvas.width;
      if (bg.type === 'building' && bg.x + bg.w < 0) bg.x = canvas.width;
      if (bg.type === 'cloud' && bg.x + bg.w < 0) bg.x = canvas.width;
      if (bg.type === 'hill' && bg.x + bg.w < 0) bg.x = canvas.width;
      if (bg.type === 'mountain' && bg.x + bg.w < 0) bg.x = canvas.width;
      if (bg.type === 'tree' && bg.x < -30) bg.x = canvas.width + 10;
    });

    // Pipes update
    for (let i = pipes.length - 1; i >= 0; i--) {
      const pipe = pipes[i];
      pipe.x -= currentPhysics.speed;

      // Collision checks
      if (checkCollision(bird, pipe)) {
        triggerGameOver();
        break;
      }

      // Check point pass
      if (!pipe.passed && pipe.x + pipe.w / 2 < bird.x) {
        pipe.passed = true;
        gameScore++;
        runPipesCleared++;
        stats.totalPipes++;
        saveStats();
        sound.playScore();
        document.getElementById('score-current').textContent = gameScore;
        
        // Spawn score flash particles
        spawnExplosion(pipe.x + pipe.w / 2, pipe.topHeight + currentPhysics.gap / 2, '#39ff14', 12);
      }

      // Remove off-screen pipes
      if (pipe.x + pipe.w < 0) {
        pipes.splice(i, 1);
        pipes.push(createPipe(canvas.width + 100)); // push a new one far side
      }
    }
  }

  // Update particles (runs on game over state too to let them decay)
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.alpha -= p.decay;
    if (p.alpha <= 0) {
      particles.splice(i, 1);
    }
  }
}

function checkCollision(b, p) {
  // Broad box bounding check first
  if (b.x + b.radius > p.x && b.x - b.radius < p.x + p.w) {
    // Inside vertical pipe band
    if (b.y - b.radius < p.topHeight || b.y + b.radius > p.bottomY) {
      // Check circles overlap with edges
      return true;
    }
  }
  return false;
}

function triggerGameOver() {
  if (gameState === 'GAMEOVER') return;
  gameState = 'GAMEOVER';
  sound.playHit();
  
  // High score update
  if (gameScore > stats.highScore) {
    stats.highScore = gameScore;
  }
  stats.totalGames++;
  saveStats();

  // Spawn dynamic debris
  spawnExplosion(bird.x, bird.y, '#ff003c', 35);
  
  // Show UI Overlays
  document.getElementById('screen-gameover').classList.remove('hidden');
  document.getElementById('summary-score').textContent = gameScore;
  document.getElementById('summary-best').textContent = stats.highScore;
  document.getElementById('btn-pause').disabled = true;

  // Verify and unlock badges
  unlockAchievement('firstFlight', 'First Flight');
  
  if (runPipesCleared >= 10) {
    unlockAchievement('pipeMaster', 'Pipe Wrangler');
  }
  if (gameScore >= 30) {
    unlockAchievement('neonGod', 'Aero-deity');
  }
  if (isHacked) {
    unlockAchievement('hacker', 'Console Breaker');
  }
}

// Canvas Drawings
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 1. Draw theme background gradient
  drawBackgroundTheme();

  // 2. Draw Parallax Background layers
  drawBackgroundParallax();

  // 3. Draw Pipes
  pipes.forEach(pipe => {
    drawPipe(pipe);
  });

  // 4. Draw Particles
  particles.forEach(p => {
    ctx.save();
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  // 5. Draw Floor Ground
  drawFloor();

  // 6. Draw Bird
  drawBird();
}

function drawBackgroundTheme() {
  let grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  if (currentTheme === 'cyberpunk') {
    grad.addColorStop(0, '#0d0822');
    grad.addColorStop(0.5, '#160e35');
    grad.addColorStop(1, '#080516');
  } else if (currentTheme === 'retro') {
    grad.addColorStop(0, '#000000');
    grad.addColorStop(1, '#050505');
  } else if (currentTheme === 'forest') {
    grad.addColorStop(0, '#0f201b');
    grad.addColorStop(0.6, '#08130f');
    grad.addColorStop(1, '#040907');
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawBackgroundParallax() {
  backgrounds.forEach(bg => {
    if (bg.type === 'star') {
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.sin(gameFrame * 0.05 + bg.x) * 0.3 + 0.6})`;
      ctx.fillRect(bg.x, bg.y, bg.size, bg.size);
    } 
    else if (bg.type === 'building') {
      ctx.fillStyle = bg.color;
      ctx.fillRect(bg.x, canvas.height - bg.h - 40, bg.w, bg.h);
      // Small details: neon windows
      ctx.fillStyle = 'rgba(0, 240, 255, 0.07)';
      if (Math.sin(bg.x * 0.01) > 0) ctx.fillStyle = 'rgba(255, 0, 127, 0.07)';
      
      const rows = Math.floor(bg.h / 18);
      const cols = Math.floor(bg.w / 14);
      for (let r = 1; r < rows; r++) {
        for (let c = 1; c < cols; c++) {
          if ((r + c + Math.floor(bg.x * 0.03)) % 5 === 0) {
            ctx.fillRect(bg.x + c * 14 - 3, canvas.height - bg.h - 40 + r * 18, 6, 8);
          }
        }
      }
    } 
    else if (bg.type === 'cloud') {
      ctx.fillStyle = 'rgba(34, 153, 13, 0.12)';
      ctx.fillRect(bg.x, bg.y, bg.w, bg.h);
      ctx.fillRect(bg.x + 8, bg.y - 8, bg.w - 16, 8);
    } 
    else if (bg.type === 'hill') {
      ctx.fillStyle = '#061702';
      ctx.beginPath();
      ctx.arc(bg.x + bg.w/2, canvas.height - 40, bg.w/2, Math.PI, 0);
      ctx.fill();
    } 
    else if (bg.type === 'mountain') {
      ctx.fillStyle = 'rgba(15, 36, 28, 0.5)';
      ctx.beginPath();
      ctx.moveTo(bg.x, canvas.height - 40);
      ctx.lineTo(bg.x + bg.w / 2, canvas.height - bg.h - 40);
      ctx.lineTo(bg.x + bg.w, canvas.height - 40);
      ctx.closePath();
      ctx.fill();
    } 
    else if (bg.type === 'tree') {
      ctx.fillStyle = '#0c1a14';
      ctx.beginPath();
      ctx.moveTo(bg.x, canvas.height - 40);
      ctx.lineTo(bg.x + 15, canvas.height - bg.h - 40);
      ctx.lineTo(bg.x + 30, canvas.height - 40);
      ctx.closePath();
      ctx.fill();
    }
  });
}

function drawPipe(pipe) {
  const topH = pipe.topHeight;
  const botY = pipe.bottomY;
  const width = pipe.w;
  const botH = canvas.height - botY - 40;

  ctx.save();
  if (currentTheme === 'cyberpunk') {
    // Pipe gradients (neon magenta & cyber blue)
    let gradTop = ctx.createLinearGradient(pipe.x, 0, pipe.x + width, 0);
    gradTop.addColorStop(0, '#ff007f');
    gradTop.addColorStop(0.4, '#8000ff');
    gradTop.addColorStop(1, '#ff007f');

    let gradBot = ctx.createLinearGradient(pipe.x, botY, pipe.x + width, botY);
    gradBot.addColorStop(0, '#00f0ff');
    gradBot.addColorStop(0.4, '#0055ff');
    gradBot.addColorStop(1, '#00f0ff');

    // Draw main tubes
    ctx.fillStyle = gradTop;
    ctx.fillRect(pipe.x + 4, 0, width - 8, topH - 24);
    
    ctx.fillStyle = gradBot;
    ctx.fillRect(pipe.x + 4, botY + 24, width - 8, botH - 24);

    // Draw tube caps
    ctx.strokeStyle = '#ff007f';
    ctx.lineWidth = 2;
    ctx.fillStyle = '#140d2b';
    ctx.fillRect(pipe.x, topH - 24, width, 24);
    ctx.strokeRect(pipe.x, topH - 24, width, 24);

    ctx.strokeStyle = '#00f0ff';
    ctx.fillStyle = '#140d2b';
    ctx.fillRect(pipe.x, botY, width, 24);
    ctx.strokeRect(pipe.x, botY, width, 24);
    
    // Add inner glowing dots on caps
    ctx.fillStyle = '#ff007f';
    ctx.fillRect(pipe.x + 6, topH - 14, 4, 4);
    ctx.fillRect(pipe.x + width - 10, topH - 14, 4, 4);
    ctx.fillStyle = '#00f0ff';
    ctx.fillRect(pipe.x + 6, botY + 10, 4, 4);
    ctx.fillRect(pipe.x + width - 10, botY + 10, 4, 4);
  } 
  else if (currentTheme === 'retro') {
    ctx.fillStyle = '#000';
    ctx.strokeStyle = '#39ff14';
    ctx.lineWidth = 3;

    // Top blocky pipe
    ctx.fillRect(pipe.x, 0, width, topH);
    ctx.strokeRect(pipe.x + 3, -10, width - 6, topH + 10);
    // Top cap
    ctx.fillRect(pipe.x - 4, topH - 24, width + 8, 24);
    ctx.strokeRect(pipe.x - 4, topH - 24, width + 8, 24);

    // Bottom blocky pipe
    ctx.fillRect(pipe.x, botY, width, botH);
    ctx.strokeRect(pipe.x + 3, botY, width - 6, botH + 10);
    // Bottom cap
    ctx.fillRect(pipe.x - 4, botY, width + 8, 24);
    ctx.strokeRect(pipe.x - 4, botY, width + 8, 24);

    // Pixel stripes for shading
    ctx.fillStyle = '#39ff14';
    ctx.fillRect(pipe.x + 10, 0, 6, topH - 24);
    ctx.fillRect(pipe.x + 10, botY + 24, 6, botH - 24);
  } 
  else if (currentTheme === 'forest') {
    // Tree trunks
    let trunkGrad = ctx.createLinearGradient(pipe.x, 0, pipe.x + width, 0);
    trunkGrad.addColorStop(0, '#5c4033');
    trunkGrad.addColorStop(0.5, '#8b5a2b');
    trunkGrad.addColorStop(1, '#3d2b1f');

    ctx.fillStyle = trunkGrad;
    ctx.fillRect(pipe.x + 8, 0, width - 16, topH - 12);
    ctx.fillRect(pipe.x + 8, botY + 12, width - 16, botH - 12);

    // Moss / Foliage caps
    let leafGrad = ctx.createRadialGradient(
      pipe.x + width/2, topH - 6, 4,
      pipe.x + width/2, topH - 6, width/2
    );
    leafGrad.addColorStop(0, '#2ecc71');
    leafGrad.addColorStop(1, '#27ae60');

    ctx.fillStyle = leafGrad;
    ctx.beginPath();
    ctx.arc(pipe.x + width/2, topH - 6, width/2, 0, Math.PI * 2);
    ctx.fill();

    let leafGradBot = ctx.createRadialGradient(
      pipe.x + width/2, botY + 6, 4,
      pipe.x + width/2, botY + 6, width/2
    );
    leafGradBot.addColorStop(0, '#2ecc71');
    leafGradBot.addColorStop(1, '#1e824c');
    ctx.fillStyle = leafGradBot;
    ctx.beginPath();
    ctx.arc(pipe.x + width/2, botY + 6, width/2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawFloor() {
  const floorY = canvas.height - 40;
  ctx.save();
  if (currentTheme === 'cyberpunk') {
    // Neon floor grid
    ctx.fillStyle = '#0a0616';
    ctx.fillRect(0, floorY, canvas.width, 40);
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, floorY);
    ctx.lineTo(canvas.width, floorY);
    ctx.stroke();

    // Perspective lines
    ctx.strokeStyle = 'rgba(255, 0, 127, 0.4)';
    ctx.lineWidth = 1;
    const speedScroll = (gameFrame * currentPhysics.speed) % 30;
    for (let x = -30; x < canvas.width + 30; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x - speedScroll, floorY);
      ctx.lineTo(x - speedScroll * 1.5 - 20, canvas.height);
      ctx.stroke();
    }
  } 
  else if (currentTheme === 'retro') {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, floorY, canvas.width, 40);
    ctx.strokeStyle = '#39ff14';
    ctx.lineWidth = 4;
    ctx.strokeRect(-10, floorY, canvas.width + 20, 50);

    // Hash lines
    ctx.beginPath();
    const step = 16;
    const offset = (gameFrame * currentPhysics.speed) % step;
    for (let x = -step; x < canvas.width + step; x += step) {
      ctx.moveTo(x - offset, floorY);
      ctx.lineTo(x - offset - 10, canvas.height);
    }
    ctx.stroke();
  } 
  else if (currentTheme === 'forest') {
    ctx.fillStyle = '#091510';
    ctx.fillRect(0, floorY, canvas.width, 40);
    // Grass top layer
    ctx.fillStyle = '#27ae60';
    ctx.fillRect(0, floorY, canvas.width, 8);
    
    // Tiny grass weeds
    ctx.fillStyle = '#2ecc71';
    const offset = (gameFrame * currentPhysics.speed) % 24;
    for (let x = -24; x < canvas.width + 24; x += 24) {
      ctx.beginPath();
      ctx.moveTo(x - offset, floorY);
      ctx.lineTo(x - offset + 4, floorY - 6);
      ctx.lineTo(x - offset + 8, floorY);
      ctx.fill();
    }
  }
  ctx.restore();
}

function drawBird() {
  ctx.save();
  ctx.translate(bird.x, bird.y);
  ctx.rotate(bird.angle);

  if (currentSkin === 'neon') {
    // Inner light core
    let glowGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, bird.radius);
    glowGrad.addColorStop(0, '#fff');
    glowGrad.addColorStop(0.3, themeColors.accentSecondary);
    glowGrad.addColorStop(1, themeColors.accentPrimary);

    ctx.fillStyle = glowGrad;
    ctx.shadowBlur = 15;
    ctx.shadowColor = themeColors.accentPrimary;
    ctx.beginPath();
    ctx.arc(0, 0, bird.radius, 0, Math.PI * 2);
    ctx.fill();

    // Outer orbital ring
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(0, 0, bird.radius + 3, bird.radius * 0.4, Math.PI/4 + bird.flapFrame * 0.15, 0, Math.PI * 2);
    ctx.stroke();
  } 
  else if (currentSkin === 'retro') {
    // Render the grid matrix pixel by pixel
    const pixelSize = 2.4;
    const startX = -6 * pixelSize;
    const startY = -5 * pixelSize;

    for (let r = 0; r < retroBirdGrid.length; r++) {
      for (let c = 0; c < retroBirdGrid[r].length; c++) {
        const val = retroBirdGrid[r][c];
        if (val === 0) continue;

        if (val === 1) ctx.fillStyle = '#000000';
        else if (val === 2) ctx.fillStyle = '#f1c40f'; // yellow
        else if (val === 3) ctx.fillStyle = '#ffffff'; // eye white
        else if (val === 4) ctx.fillStyle = '#e67e22'; // beak
        else if (val === 5) {
          // Wing changes position with flap frame
          ctx.fillStyle = bird.flapFrame > 0 ? '#f1c40f' : '#ffffff';
        }

        ctx.fillRect(startX + c * pixelSize, startY + r * pixelSize, pixelSize, pixelSize);
      }
    }
  } 
  else if (currentSkin === 'rocket') {
    // Metallic spaceship fuselage
    let metalGrad = ctx.createLinearGradient(-15, -10, 15, 10);
    metalGrad.addColorStop(0, '#bdc3c7');
    metalGrad.addColorStop(0.5, '#ecf0f1');
    metalGrad.addColorStop(1, '#95a5a6');

    ctx.fillStyle = metalGrad;
    ctx.strokeStyle = '#7f8c8d';
    ctx.lineWidth = 1.5;
    
    // Draw nose cone capsule shape
    ctx.beginPath();
    ctx.moveTo(18, 0);
    ctx.bezierCurveTo(8, -12, -8, -12, -18, -10);
    ctx.lineTo(-18, 10);
    ctx.bezierCurveTo(-8, 12, 8, 12, 18, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Thruster ring
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(-22, -6, 4, 12);

    // Thrust Fire particles
    if (gameState === 'PLAYING' && bird.velocity < 0) {
      ctx.fillStyle = '#f39c12';
      ctx.beginPath();
      ctx.moveTo(-22, -4);
      ctx.lineTo(-34 - (Math.random() * 8), 0);
      ctx.lineTo(-22, 4);
      ctx.closePath();
      ctx.fill();
    }

    // Cockpit glass
    ctx.fillStyle = '#3498db';
    ctx.beginPath();
    ctx.arc(6, -2, 4, 0, Math.PI * 2);
    ctx.fill();
  } 
  else if (currentSkin === 'bat') {
    ctx.fillStyle = '#2c3e50';
    
    // Wings flapping based on sinus
    const wingFlapAngle = bird.flapFrame * 0.6;

    // Left Wing
    ctx.save();
    ctx.rotate(-wingFlapAngle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-15, -18, -25, -6, -28, 4);
    ctx.bezierCurveTo(-20, 4, -10, 12, 0, 0);
    ctx.fill();
    ctx.restore();

    // Right Wing
    ctx.save();
    ctx.rotate(wingFlapAngle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(15, -18, 25, -6, 28, 4);
    ctx.bezierCurveTo(20, 4, 10, 12, 0, 0);
    ctx.fill();
    ctx.restore();

    // Bat Head/Body core
    ctx.fillStyle = '#1a252f';
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, Math.PI * 2);
    ctx.fill();

    // Pointy Ears
    ctx.beginPath();
    ctx.moveTo(-8, -6);
    ctx.lineTo(-10, -15);
    ctx.lineTo(-3, -9);
    ctx.moveTo(3, -9);
    ctx.lineTo(10, -15);
    ctx.lineTo(8, -6);
    ctx.fill();

    // Glowing red eyes
    ctx.fillStyle = '#ff3333';
    ctx.fillRect(-4, -4, 2, 2);
    ctx.fillRect(2, -4, 2, 2);
  }

  ctx.restore();
}

// Main Frame tick loop
function tick() {
  update();
  draw();
  requestAnimationFrame(tick);
}

// --- STATE MANAGEMENT AND INTERACTION LISTENERS ---
function startGameplay() {
  if (gameState !== 'START' && gameState !== 'GAMEOVER') return;
  sound.init();
  resetGame();
  gameState = 'PLAYING';
  
  document.getElementById('screen-start').classList.add('hidden');
  document.getElementById('screen-gameover').classList.add('hidden');
  document.getElementById('btn-pause').disabled = false;
}

function pauseGame() {
  if (gameState !== 'PLAYING') return;
  gameState = 'PAUSED';
  document.getElementById('screen-pause').classList.remove('hidden');
}

function resumeGame() {
  if (gameState !== 'PAUSED') return;
  sound.init();
  gameState = 'PLAYING';
  document.getElementById('screen-pause').classList.add('hidden');
}

function abortGame() {
  gameState = 'START';
  document.getElementById('screen-pause').classList.add('hidden');
  document.getElementById('screen-start').classList.remove('hidden');
  document.getElementById('btn-pause').disabled = true;
  resetGame();
}

// --- INITIALIZATION ---
window.addEventListener('load', () => {
  // Load Stats & Badges
  loadStats();
  updateThemeColors();
  resetGame();
  
  // Set up animation loops
  requestAnimationFrame(tick);

  // User input bindings
  const handleJumpTrigger = (e) => {
    // Avoid double events or button interference
    if (e.target.closest('button') || e.target.closest('input')) return;
    
    if (gameState === 'PLAYING') {
      handleFlap();
    } else if (gameState === 'START') {
      startGameplay();
    }
  };

  // Keyboard space / controls
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
      e.preventDefault();
      if (gameState === 'PLAYING') {
        handleFlap();
      } else if (gameState === 'START') {
        startGameplay();
      } else if (gameState === 'GAMEOVER') {
        startGameplay();
      }
    }
    if (e.key === 'p' || e.key === 'P') {
      if (gameState === 'PLAYING') {
        pauseGame();
      } else if (gameState === 'PAUSED') {
        resumeGame();
      }
    }
  });

  // Tap or click on canvas container
  const container = document.querySelector('.canvas-container');
  container.addEventListener('mousedown', handleJumpTrigger);
  container.addEventListener('touchstart', (e) => {
    e.preventDefault();
    handleJumpTrigger(e);
  }, { passive: false });

  // Play button triggers
  document.getElementById('btn-play-start').addEventListener('click', startGameplay);
  document.getElementById('btn-restart').addEventListener('click', startGameplay);
  
  // Pause management overlay triggers
  document.getElementById('btn-pause').addEventListener('click', () => {
    if (gameState === 'PLAYING') pauseGame();
  });
  document.getElementById('btn-resume').addEventListener('click', resumeGame);
  document.getElementById('btn-abort').addEventListener('click', abortGame);

  // Visual Theme Selectors
  document.querySelectorAll('.theme-selector .theme-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.theme-selector .theme-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const theme = btn.dataset.theme;
      document.body.className = ''; // wipe current themes
      document.body.classList.add(`theme-${theme}`);
      currentTheme = theme;
      
      initParallaxBackground();
      updateThemeColors();
    });
  });

  // Skin Selectors
  document.querySelectorAll('.skin-selector .skin-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.skin-selector .skin-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentSkin = btn.dataset.skin;
    });
  });

  // Sound Buttons
  const soundBtn = document.getElementById('btn-sound');
  const soundOnSvg = document.getElementById('sound-on-svg');
  const soundOffSvg = document.getElementById('sound-off-svg');

  soundBtn.addEventListener('click', () => {
    sound.muted = !sound.muted;
    soundOnSvg.classList.toggle('hidden', sound.muted);
    soundOffSvg.classList.toggle('hidden', !sound.muted);
    if (!sound.muted) {
      sound.init();
      sound.playFlap();
    }
  });

  // Physics presets triggers
  document.querySelectorAll('.difficulty-presets .preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      applyPhysicsPreset(btn.dataset.preset);
    });
  });

  // Reset Physics Hack
  document.getElementById('btn-reset-physics').addEventListener('click', () => {
    applyPhysicsPreset('normal');
  });

  // Sliders binding
  document.getElementById('slider-gravity').addEventListener('input', handlePhysicsSliderChange);
  document.getElementById('slider-jump').addEventListener('input', handlePhysicsSliderChange);
  document.getElementById('slider-speed').addEventListener('input', handlePhysicsSliderChange);
  document.getElementById('slider-gap').addEventListener('input', handlePhysicsSliderChange);

  // Danger Button: Reset Save Stats
  document.getElementById('btn-clear-data').addEventListener('click', () => {
    if (confirm("Are you sure you want to delete all local scores, logs, and simulation badges?")) {
      stats = {
        highScore: 0,
        totalGames: 0,
        totalPipes: 0,
        totalJumps: 0,
        achievements: {
          firstFlight: false,
          pipeMaster: false,
          neonGod: false,
          hacker: false
        }
      };
      saveStats();
      updateAchievementsListUI();
      sound.playHit();
    }
  });
});

// ============================================
// Game Configuration
// ============================================
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;

// Create PixiJS application
const app = new PIXI.Application({
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: 0x0A0A0A,
    antialias: true,
    resolution: window.devicePixelRatio || 1
});

document.getElementById('game-container').appendChild(app.view);

// Center the canvas
app.view.style.position = 'absolute';
app.view.style.left = '50%';
app.view.style.top = '50%';
app.view.style.transform = 'translate(-50%, -50%)';
app.view.style.maxWidth = '100%';
app.view.style.maxHeight = '100%';

// ============================================
// Game Objects
// ============================================
const player = {
    sprite: null,
    x: GAME_WIDTH / 2,
    y: GAME_HEIGHT - 80,
    width: 30,
    height: 30,
    speed: 6,
    targetX: GAME_WIDTH / 2,
    fireCooldown: 0,
    fireDelay: 12  // frames between shots
};

let asteroids = [];
let bullets = [];
let explosions = [];
let stars = [];

let score = 0;
let gameRunning = true;
let gameLoopId = null;

// ============================================
// Create Graphics
// ============================================
function createPlayer() {
    const graphics = new PIXI.Graphics();

    // Draw triangle ship
    graphics.beginFill(0xE6B85C);
    graphics.moveTo(0, -15);
    graphics.lineTo(-12, 10);
    graphics.lineTo(-6, 10);
    graphics.lineTo(-6, 15);
    graphics.lineTo(0, 12);
    graphics.lineTo(6, 15);
    graphics.lineTo(6, 10);
    graphics.lineTo(12, 10);
    graphics.lineTo(0, -15);
    graphics.endFill();

    // Engine glow
    graphics.beginFill(0xC45C3A, 0.6);
    graphics.drawCircle(0, 12, 4);
    graphics.endFill();

    const sprite = new PIXI.Sprite(app.renderer.generateTexture(graphics));
    sprite.anchor.set(0.5, 0.5);
    sprite.x = player.x;
    sprite.y = player.y;
    app.stage.addChild(sprite);
    return sprite;
}

function createAsteroid(x, y, size = 20) {
    const graphics = new PIXI.Graphics();

    // Irregular shape
    graphics.beginFill(0x8B5A2B);
    graphics.moveTo(0, -size);
    graphics.lineTo(size * 0.7, -size * 0.3);
    graphics.lineTo(size * 0.5, size * 0.3);
    graphics.lineTo(0, size * 0.8);
    graphics.lineTo(-size * 0.5, size * 0.3);
    graphics.lineTo(-size * 0.7, -size * 0.3);
    graphics.lineTo(0, -size);
    graphics.endFill();

    // Add texture
    graphics.beginFill(0x6B3A1B);
    for (let i = 0; i < 3; i++) {
        const angle = Math.random() * Math.PI * 2;
        const rad = size * 0.3;
        graphics.drawCircle(Math.cos(angle) * rad, Math.sin(angle) * rad, 2);
    }
    graphics.endFill();

    const sprite = new PIXI.Sprite(app.renderer.generateTexture(graphics));
    sprite.anchor.set(0.5, 0.5);
    sprite.x = x;
    sprite.y = y;
    sprite.width = size * 2;
    sprite.height = size * 2;
    app.stage.addChild(sprite);
    return sprite;
}

function createBullet(x, y) {
    const graphics = new PIXI.Graphics();
    graphics.beginFill(0xF6B626);
    graphics.drawRect(-2, -4, 4, 8);
    graphics.endFill();

    const sprite = new PIXI.Sprite(app.renderer.generateTexture(graphics));
    sprite.anchor.set(0.5, 0.5);
    sprite.x = x;
    sprite.y = y;
    app.stage.addChild(sprite);
    return sprite;
}

function createExplosion(x, y) {
    const particles = [];
    for (let i = 0; i < 12; i++) {
        const graphics = new PIXI.Graphics();
        graphics.beginFill(0xF64A4A);
        graphics.drawCircle(0, 0, 2 + Math.random() * 3);
        graphics.endFill();

        const particle = new PIXI.Sprite(app.renderer.generateTexture(graphics));
        particle.anchor.set(0.5, 0.5);
        particle.x = x + (Math.random() - 0.5) * 20;
        particle.y = y + (Math.random() - 0.5) * 20;
        particle.vx = (Math.random() - 0.5) * 8;
        particle.vy = (Math.random() - 0.5) * 8 - 2;
        particle.life = 30;
        app.stage.addChild(particle);
        particles.push(particle);
    }
    explosions.push({ particles, life: 30 });
}

function createStars() {
    for (let i = 0; i < 150; i++) {
        const star = new PIXI.Graphics();
        star.beginFill(0xFFFFFF, 0.5 + Math.random() * 0.5);
        star.drawCircle(0, 0, 1 + Math.random() * 2);
        star.endFill();
        const sprite = new PIXI.Sprite(app.renderer.generateTexture(star));
        sprite.x = Math.random() * GAME_WIDTH;
        sprite.y = Math.random() * GAME_HEIGHT;
        sprite.alpha = 0.3 + Math.random() * 0.7;
        app.stage.addChild(sprite);
        stars.push(sprite);
    }
}

// ============================================
// Game Logic
// ============================================
function spawnAsteroid() {
    if (!gameRunning) return;

    const x = Math.random() * GAME_WIDTH;
    const y = -30;
    const size = 15 + Math.random() * 15;
    const speedY = 1.5 + Math.random() * 3;
    const rotationSpeed = (Math.random() - 0.5) * 0.05;

    const sprite = createAsteroid(x, y, size);
    asteroids.push({ sprite, x, y, size, speedY, rotationSpeed });
}

function shoot() {
    if (!gameRunning) return;

    const bullet = {
        sprite: createBullet(player.x, player.y - 20),
        x: player.x,
        y: player.y - 20,
        speedY: -8
    };
    bullets.push(bullet);
}

// Update game
function updateGame() {
    if (!gameRunning) return;

    // Update player position
    player.x += (player.targetX - player.x) * 0.2;
    player.x = Math.min(Math.max(player.x, 20), GAME_WIDTH - 20);
    player.sprite.x = player.x;
    player.sprite.y = player.y;

    // Cooldown
    if (player.fireCooldown > 0) player.fireCooldown--;

    // Update asteroids
    for (let i = asteroids.length - 1; i >= 0; i--) {
        const a = asteroids[i];
        a.y += a.speedY;
        a.sprite.y = a.y;
        a.sprite.rotation += a.rotationSpeed;

        // Check collision with player
        const dx = a.x - player.x;
        const dy = a.y - player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < a.size + 15) {
            gameRunning = false;
            createExplosion(player.x, player.y);
            return;
        }

        // Remove if off screen
        if (a.y > GAME_HEIGHT + 50) {
            app.stage.removeChild(a.sprite);
            asteroids.splice(i, 1);
        }
    }

    // Update bullets
    for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        b.y += b.speedY;
        b.sprite.y = b.y;

        // Check collisions with asteroids
        let hit = false;
        for (let j = asteroids.length - 1; j >= 0; j--) {
            const a = asteroids[j];
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < a.size + 5) {
                // Asteroid destroyed
                app.stage.removeChild(a.sprite);
                asteroids.splice(j, 1);
                hit = true;

                // Increase score
                score++;
                document.getElementById('score').textContent = score;

                // Update high score
                if (saveHighScore('asteroid-shooter', score)) {
                    document.getElementById('highScore').textContent = score;
                }

                // Create explosion
                createExplosion(b.x, b.y);
                break;
            }
        }

        // Remove bullet if hit or out of bounds
        if (hit || b.y < -20) {
            app.stage.removeChild(b.sprite);
            bullets.splice(i, 1);
        }
    }

    // Update explosions
    for (let i = explosions.length - 1; i >= 0; i--) {
        const exp = explosions[i];
        exp.life--;

        for (let p of exp.particles) {
            p.x += p.vx;
            p.y += p.vy;
            p.alpha = exp.life / 30;
        }

        if (exp.life <= 0) {
            for (let p of exp.particles) {
                app.stage.removeChild(p);
            }
            explosions.splice(i, 1);
        }
    }

    // Update stars (parallax effect)
    for (let star of stars) {
        star.y += 0.5;
        if (star.y > GAME_HEIGHT) star.y = 0;
    }

    // Spawn asteroids
    if (Math.random() < 0.02 && asteroids.length < 12) {
        spawnAsteroid();
    }
}

// Animation loop
function gameLoop() {
    updateGame();
    gameLoopId = requestAnimationFrame(gameLoop);
}

// ============================================
// Input Handling
// ============================================
function handleMove(clientX) {
    if (!gameRunning) return;

    const rect = app.view.getBoundingClientRect();
    const scaleX = GAME_WIDTH / rect.width;
    let canvasX = (clientX - rect.left) * scaleX;
    canvasX = Math.min(Math.max(canvasX, 0), GAME_WIDTH);
    player.targetX = canvasX;
}

app.view.addEventListener('mousemove', (e) => handleMove(e.clientX));
app.view.addEventListener('touchmove', (e) => {
    e.preventDefault();
    handleMove(e.touches[0].clientX);
});

app.view.addEventListener('click', () => {
    if (player.fireCooldown === 0) {
        shoot();
        player.fireCooldown = player.fireDelay;
    }
});

app.view.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (player.fireCooldown === 0) {
        shoot();
        player.fireCooldown = player.fireDelay;
    }
});

// ============================================
// Restart
// ============================================
function restartGame() {
    gameRunning = false;

    // Clear all objects
    for (let a of asteroids) app.stage.removeChild(a.sprite);
    for (let b of bullets) app.stage.removeChild(b.sprite);
    for (let e of explosions) {
        for (let p of e.particles) app.stage.removeChild(p);
    }

    asteroids = [];
    bullets = [];
    explosions = [];
    score = 0;
    gameRunning = true;

    document.getElementById('score').textContent = '0';
    player.x = GAME_WIDTH / 2;
    player.targetX = GAME_WIDTH / 2;
    player.sprite.x = player.x;

    // Spawn initial asteroids
    for (let i = 0; i < 5; i++) {
        setTimeout(() => spawnAsteroid(), i * 200);
    }
}

document.getElementById('restartBtn').addEventListener('click', restartGame);

// ============================================
// Initialize Game
// ============================================
player.sprite = createPlayer();
createStars();
document.getElementById('highScore').textContent = getHighScore('asteroid-shooter');

// Spawn initial asteroids
for (let i = 0; i < 5; i++) {
    setTimeout(() => spawnAsteroid(), i * 200);
}

// Start game
gameLoop();

// Handle window resize
window.addEventListener('resize', () => {
    const container = document.getElementById('game-container');
    const scale = Math.min(
        container.clientWidth / GAME_WIDTH,
        container.clientHeight / GAME_HEIGHT
    );
    app.view.style.transform = `translate(-50%, -50%) scale(${scale})`;
});
// ============================================================================
// COSMIC EXPLORER - 3D Space Adventure Game
// A casual, relaxing exploration game with deep gameplay (10+ minutes)
// Desktop & Mobile compatible with Phaser 3
// ============================================================================

class CosmicExplorerGame {
    constructor() {
        this.config = {
            type: Phaser.AUTO,
            parent: 'game-container',
            render: {
                antialias: true,
                pixelArt: false,
                backgroundColor: '#0a1932'
            },
            scene: {
                create: () => this.create(),
                update: () => this.update(),
                render: () => this.render()
            },
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { y: 0 },
                    debug: false
                }
            }
        };

        this.game = new Phaser.Game(this.config);
        this.scene = null;
        
        // Game state
        this.gameState = {
            score: 0,
            health: 100,
            maxHealth: 100,
            artifactsFound: 0,
            distanceTraveled: 0,
            chapter: 1,
            level: 1,
            isGameOver: false,
            isPaused: false,
            lastAsteroidTime: 0,
            asteroidSpawnRate: 2000
        };

        // Player state
        this.player = {
            x: 400,
            y: 300,
            vx: 0,
            vy: 0,
            speed: 200,
            size: 15,
            rotation: 0
        };

        // Input tracking for smooth movement
        this.keys = {
            w: false, a: false, s: false, d: false,
            space: false, ctrl: false,
            up: false, left: false, down: false, right: false
        };

        // Mobile touch tracking
        this.touchStart = { x: 0, y: 0 };
        this.touchCurrent = { x: 0, y: 0 };

        // Game objects
        this.asteroids = [];
        this.artifacts = [];
        this.particles = [];
        this.projectiles = [];
        this.hazards = [];
        this.ui = {};

        // Chapters & progression
        this.chapters = [
            { num: 1, name: 'The Awakening', artifactTarget: 3, difficulty: 0.5 },
            { num: 2, name: 'The Lost Station', artifactTarget: 5, difficulty: 0.75 },
            { num: 3, name: 'Nebula Crossing', artifactTarget: 5, difficulty: 1.0 }
        ];

        this.currentChapter = this.chapters[0];
    }

    create() {
        this.scene = this.game.scene.scenes[0];
        this.setupInput();
        this.setupUI();
        this.initializeLevel();
    }

    setupInput() {
        // Keyboard input
        this.scene.input.keyboard.on('keydown', (event) => {
            const key = event.key.toLowerCase();
            if (key === 'w') this.keys.w = true;
            if (key === 'a') this.keys.a = true;
            if (key === 's') this.keys.s = true;
            if (key === 'd') this.keys.d = true;
            if (event.keyCode === 32) { this.keys.space = true; event.preventDefault(); }
            if (event.keyCode === 17) this.keys.ctrl = true;
            if (key === 'arrowup') this.keys.up = true;
            if (key === 'arrowleft') this.keys.left = true;
            if (key === 'arrowdown') this.keys.down = true;
            if (key === 'arrowright') this.keys.right = true;
        });

        this.scene.input.keyboard.on('keyup', (event) => {
            const key = event.key.toLowerCase();
            if (key === 'w') this.keys.w = false;
            if (key === 'a') this.keys.a = false;
            if (key === 's') this.keys.s = false;
            if (key === 'd') this.keys.d = false;
            if (event.keyCode === 32) this.keys.space = false;
            if (event.keyCode === 17) this.keys.ctrl = false;
            if (key === 'arrowup') this.keys.up = false;
            if (key === 'arrowleft') this.keys.left = false;
            if (key === 'arrowdown') this.keys.down = false;
            if (key === 'arrowright') this.keys.right = false;
        });

        // Touch/Mobile input
        this.scene.input.on('pointerdown', (pointer) => {
            this.touchStart = { x: pointer.x, y: pointer.y };
            this.touchCurrent = { x: pointer.x, y: pointer.y };
        });

        this.scene.input.on('pointermove', (pointer) => {
            this.touchCurrent = { x: pointer.x, y: pointer.y };
        });

        this.scene.input.on('pointerup', (pointer) => {
            // Tap detection for artifact interaction
            const dist = Phaser.Math.Distance.Between(
                this.touchStart.x, this.touchStart.y,
                pointer.x, pointer.y
            );
            if (dist < 20) {
                this.scanForArtifacts();
            }
        });
    }

    setupUI() {
        this.ui = {
            scoreEl: document.getElementById('scoreDisplay'),
            artifactsEl: document.getElementById('artifactsDisplay'),
            distanceEl: document.getElementById('distanceDisplay'),
            healthEl: document.getElementById('healthDisplay'),
            chapterEl: document.getElementById('chapterDisplay')
        };
    }

    initializeLevel() {
        this.asteroids = [];
        this.artifacts = [];
        this.particles = [];
        this.hazards = [];

        // Generate initial asteroids
        for (let i = 0; i < 8; i++) {
            this.spawnAsteroid();
        }

        // Generate artifacts for this chapter
        for (let i = 0; i < 3; i++) {
            this.spawnArtifact();
        }

        this.updateUI();
    }

    spawnAsteroid() {
        const gameWidth = this.scene.cameras.main.width;
        const gameHeight = this.scene.cameras.main.height;

        // Spawn off-screen, moving toward player
        const side = Phaser.Math.RND.pick(['top', 'bottom', 'left', 'right']);
        let x, y, vx, vy;

        if (side === 'top') {
            x = Phaser.Math.RND.between(0, gameWidth);
            y = -30;
            vx = Phaser.Math.RND.between(-100, 100);
            vy = Phaser.Math.RND.between(50, 150);
        } else if (side === 'bottom') {
            x = Phaser.Math.RND.between(0, gameWidth);
            y = gameHeight + 30;
            vx = Phaser.Math.RND.between(-100, 100);
            vy = Phaser.Math.RND.between(-150, -50);
        } else if (side === 'left') {
            x = -30;
            y = Phaser.Math.RND.between(0, gameHeight);
            vx = Phaser.Math.RND.between(50, 150);
            vy = Phaser.Math.RND.between(-100, 100);
        } else {
            x = gameWidth + 30;
            y = Phaser.Math.RND.between(0, gameHeight);
            vx = Phaser.Math.RND.between(-150, -50);
            vy = Phaser.Math.RND.between(-100, 100);
        }

        const size = Phaser.Math.RND.between(12, 28);
        const asteroid = {
            x, y, vx, vy, size,
            rotation: Phaser.Math.RND.angle(),
            rotationSpeed: Phaser.Math.RND.between(-5, 5),
            health: size / 2
        };

        this.asteroids.push(asteroid);
    }

    spawnArtifact() {
        const gameWidth = this.scene.cameras.main.width;
        const gameHeight = this.scene.cameras.main.height;

        const artifact = {
            x: Phaser.Math.RND.between(50, gameWidth - 50),
            y: Phaser.Math.RND.between(50, gameHeight - 50),
            radius: 10,
            glow: 0,
            collected: false,
            glowSpeed: 0.05,
            type: Phaser.Math.RND.pick(['ancient', 'crystalline', 'energy'])
        };

        this.artifacts.push(artifact);
    }

    scanForArtifacts() {
        const gameWidth = this.scene.cameras.main.width;
        const gameHeight = this.scene.cameras.main.height;

        for (let artifact of this.artifacts) {
            if (!artifact.collected) {
                const dist = Phaser.Math.Distance.Between(
                    this.player.x, this.player.y,
                    artifact.x, artifact.y
                );

                if (dist < 150) {
                    artifact.collected = true;
                    this.gameState.artifactsFound++;
                    this.gameState.score += 500;
                    this.createParticleExplosion(artifact.x, artifact.y, '#FFD700');

                    // Check if chapter complete
                    if (this.gameState.artifactsFound % this.currentChapter.artifactTarget === 0) {
                        this.advanceChapter();
                    }
                }
            }
        }
    }

    advanceChapter() {
        const currentIndex = this.currentChapter.num - 1;
        if (currentIndex < this.chapters.length - 1) {
            this.currentChapter = this.chapters[currentIndex + 1];
            this.gameState.chapter = this.currentChapter.num;
            this.gameState.asteroidSpawnRate = Math.max(800, 2000 - (this.currentChapter.difficulty * 1000));

            // Clear and respawn
            this.artifacts = [];
            for (let i = 0; i < 3; i++) {
                this.spawnArtifact();
            }

            this.createParticleExplosion(this.player.x, this.player.y, '#00FFFF');
            this.gameState.score += 1000;
        }
    }

    update() {
        if (this.gameState.isGameOver) return;

        // Update player movement from keyboard
        this.player.vx = 0;
        this.player.vy = 0;

        if (this.keys.w || this.keys.up) this.player.vy -= this.player.speed;
        if (this.keys.s || this.keys.down) this.player.vy += this.player.speed;
        if (this.keys.a || this.keys.left) this.player.vx -= this.player.speed;
        if (this.keys.d || this.keys.right) this.player.vx += this.player.speed;

        // Mobile swipe movement
        const dx = this.touchCurrent.x - this.touchStart.x;
        const dy = this.touchCurrent.y - this.touchStart.y;
        if (Math.abs(dx) > 20 || Math.abs(dy) > 20) {
            this.player.vx += dx * 0.3;
            this.player.vy += dy * 0.3;
        }

        // Ascend/Descend with visual effect (glow intensity)
        if (this.keys.space) {
            this.player.vy -= 150;
        }
        if (this.keys.ctrl) {
            this.player.vy += 150;
        }

        // Update player position with bounds
        const gameWidth = this.scene.cameras.main.width;
        const gameHeight = this.scene.cameras.main.height;

        this.player.x += this.player.vx * (1 / 60);
        this.player.y += this.player.vy * (1 / 60);

        // Smooth wrapping at edges
        if (this.player.x < -20) this.player.x = gameWidth + 20;
        if (this.player.x > gameWidth + 20) this.player.x = -20;
        if (this.player.y < -20) this.player.y = gameHeight + 20;
        if (this.player.y > gameHeight + 20) this.player.y = -20;

        // Update rotation toward movement direction
        if (Math.abs(this.player.vx) > 10 || Math.abs(this.player.vy) > 10) {
            const angle = Math.atan2(this.player.vy, this.player.vx);
            this.player.rotation = Phaser.Math.Angle.Wrap(angle);
        }

        // Update distance traveled
        this.gameState.distanceTraveled += Phaser.Math.Distance.Between(0, 0, this.player.vx, this.player.vy) * 0.001;

        // Update asteroids
        this.asteroids.forEach((asteroid, index) => {
            asteroid.x += asteroid.vx * (1 / 60);
            asteroid.y += asteroid.vy * (1 / 60);
            asteroid.rotation += asteroid.rotationSpeed * (1 / 60);

            // Wrap asteroids
            if (asteroid.x < -50) asteroid.x = gameWidth + 50;
            if (asteroid.x > gameWidth + 50) asteroid.x = -50;
            if (asteroid.y < -50) asteroid.y = gameHeight + 50;
            if (asteroid.y > gameHeight + 50) asteroid.y = -50;

            // Collision with player
            const dist = Phaser.Math.Distance.Between(
                this.player.x, this.player.y,
                asteroid.x, asteroid.y
            );

            if (dist < this.player.size + asteroid.size) {
                this.gameState.health -= 5;
                this.createParticleExplosion(asteroid.x, asteroid.y, '#FF4444');
                this.asteroids.splice(index, 1);

                if (this.gameState.health <= 0) {
                    this.endGame();
                }
            }
        });

        // Update artifacts
        this.artifacts.forEach((artifact) => {
            if (!artifact.collected) {
                artifact.glow = (artifact.glow + artifact.glowSpeed) % (Math.PI * 2);

                // Gentle hovering animation
                artifact.y += Math.sin(artifact.glow * 0.5) * 0.5;

                // Scanner highlight when near
                const dist = Phaser.Math.Distance.Between(
                    this.player.x, this.player.y,
                    artifact.x, artifact.y
                );

                if (dist < 150 && dist > 80) {
                    artifact.highlight = true;
                } else {
                    artifact.highlight = false;
                }
            }
        });

        // Spawn new asteroids gradually
        this.gameState.lastAsteroidTime += 16; // ~60fps
        if (this.gameState.lastAsteroidTime > this.gameState.asteroidSpawnRate) {
            if (this.asteroids.length < 6 + (this.gameState.chapter * 2)) {
                this.spawnAsteroid();
            }
            this.gameState.lastAsteroidTime = 0;
        }

        // Update particles
        this.particles.forEach((particle, index) => {
            particle.x += particle.vx * (1 / 60);
            particle.y += particle.vy * (1 / 60);
            particle.life -= 1 / 60;
            particle.vx *= 0.98;
            particle.vy *= 0.98;

            if (particle.life <= 0) {
                this.particles.splice(index, 1);
            }
        });

        this.updateUI();
    }

    createParticleExplosion(x, y, color) {
        for (let i = 0; i < 12; i++) {
            const angle = (Math.PI * 2 * i) / 12;
            const speed = Phaser.Math.RND.between(150, 300);
            const particle = {
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1,
                color
            };
            this.particles.push(particle);
        }
    }

    updateUI() {
        if (this.ui.scoreEl) this.ui.scoreEl.textContent = this.gameState.score;
        if (this.ui.artifactsEl) this.ui.artifactsEl.textContent = this.gameState.artifactsFound;
        if (this.ui.distanceEl) this.ui.distanceEl.textContent = Math.floor(this.gameState.distanceTraveled) + ' LY';
        if (this.ui.healthEl) this.ui.healthEl.textContent = Math.max(0, Math.floor(this.gameState.health)) + '%';
        if (this.ui.chapterEl) this.ui.chapterEl.textContent = `Chapter ${this.gameState.chapter}: ${this.currentChapter.name}`;
    }

    render() {
        const ctx = this.scene.canvas.getContext('2d');
        const width = this.scene.cameras.main.width;
        const height = this.scene.cameras.main.height;

        // Clear with space background
        ctx.fillStyle = '#0a1932';
        ctx.fillRect(0, 0, width, height);

        // Draw distant stars
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        for (let i = 0; i < 100; i++) {
            const x = (i * 73) % width;
            const y = (i * 127) % height;
            ctx.fillRect(x, y, 1, 1);
        }

        // Draw asteroids
        this.asteroids.forEach((asteroid) => {
            ctx.save();
            ctx.translate(asteroid.x, asteroid.y);
            ctx.rotate(asteroid.rotation);

            ctx.fillStyle = '#8B7355';
            ctx.beginPath();
            for (let i = 0; i < 8; i++) {
                const angle = (Math.PI * 2 * i) / 8 + Phaser.Math.RND.between(-0.3, 0.3);
                const radius = asteroid.size * (0.8 + Math.random() * 0.2);
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.fill();

            ctx.strokeStyle = '#A0826D';
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.restore();
        });

        // Draw artifacts
        this.artifacts.forEach((artifact) => {
            if (!artifact.collected) {
                const glowIntensity = Math.abs(Math.sin(artifact.glow)) * 0.5 + 0.5;

                // Glow effect
                ctx.fillStyle = `rgba(255, 215, 0, ${glowIntensity * 0.4})`;
                ctx.beginPath();
                ctx.arc(artifact.x, artifact.y, artifact.radius * 3, 0, Math.PI * 2);
                ctx.fill();

                // Highlight if near
                if (artifact.highlight) {
                    ctx.strokeStyle = `rgba(100, 200, 255, 0.8)`;
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.arc(artifact.x, artifact.y, artifact.radius * 4, 0, Math.PI * 2);
                    ctx.stroke();
                }

                // Core
                ctx.fillStyle = '#FFD700';
                ctx.beginPath();
                ctx.arc(artifact.x, artifact.y, artifact.radius, 0, Math.PI * 2);
                ctx.fill();

                // Center sparkle
                ctx.fillStyle = '#FFFFFF';
                ctx.beginPath();
                ctx.arc(artifact.x - 2, artifact.y - 2, 2, 0, Math.PI * 2);
                ctx.fill();
            }
        });

        // Draw player ship
        ctx.save();
        ctx.translate(this.player.x, this.player.y);
        ctx.rotate(this.player.rotation);

        // Ship body
        ctx.fillStyle = '#00CCFF';
        ctx.beginPath();
        ctx.moveTo(this.player.size, 0);
        ctx.lineTo(-this.player.size * 0.7, -this.player.size * 0.8);
        ctx.lineTo(-this.player.size * 0.4, 0);
        ctx.lineTo(-this.player.size * 0.7, this.player.size * 0.8);
        ctx.closePath();
        ctx.fill();

        // Ship glow
        ctx.strokeStyle = 'rgba(0, 204, 255, 0.6)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Engine glow
        ctx.fillStyle = 'rgba(255, 100, 0, 0.7)';
        ctx.beginPath();
        ctx.arc(-this.player.size * 0.5, 0, this.player.size * 0.6, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        // Draw particles
        this.particles.forEach((particle) => {
            ctx.fillStyle = particle.color + Math.floor(particle.life * 255).toString(16).padStart(2, '0');
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
            ctx.fill();
        });

        // Draw health bar
        const barWidth = 100;
        const barHeight = 8;
        const barX = 20;
        const barY = 20;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(barX, barY, barWidth, barHeight);

        const healthPercent = Math.max(0, this.gameState.health / this.gameState.maxHealth);
        ctx.fillStyle = healthPercent > 0.5 ? '#00FF00' : healthPercent > 0.25 ? '#FFff00' : '#FF0000';
        ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);

        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;
        ctx.strokeRect(barX, barY, barWidth, barHeight);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = '12px "JetBrains Mono"';
        ctx.fillText('SHIELD', barX, barY - 5);
    }

    endGame() {
        this.gameState.isGameOver = true;
        alert(`Game Over!\nFinal Score: ${this.gameState.score}\nArtifacts Found: ${this.gameState.artifactsFound}\nDistance: ${Math.floor(this.gameState.distanceTraveled)} LY`);
        window.location.reload();
    }
}

// Initialize game when page loads
window.addEventListener('DOMContentLoaded', () => {
    new CosmicExplorerGame();
});
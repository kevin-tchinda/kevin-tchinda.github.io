// Game configuration
const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: 800,
    height: 400,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 800 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

let game;
let player;
let cursors;
let platforms;
let obstacles;
let books;
let score = 0;
let scoreText;
let isSliding = false;
let normalHeight;
let slideHeight;
let swipeStartY = 0;

// Touch swipe detection
function handleTouchStart(event) {
    swipeStartY = event.touches[0].clientY;
}

function handleTouchEnd(event) {
    const endY = event.changedTouches[0].clientY;
    const diff = swipeStartY - endY;
    if (Math.abs(diff) > 30) {
        if (diff > 0) {
            jump();
        } else {
            slide();
        }
    }
    event.preventDefault();
}

function jump() {
    if (player.body.touching.down && !isSliding) {
        player.setVelocityY(-400);
    }
}

function slide() {
    if (player.body.touching.down && !isSliding) {
        isSliding = true;
        player.setSize(30, 20);
        player.setOffset(5, 25);
        player.setVelocityY(0);
        // After a short delay, stand back up
        game.time.delayedCall(500, () => {
            player.setSize(30, 40);
            player.setOffset(5, 5);
            isSliding = false;
        });
    }
}

function preload() {
    // Simple graphics: we'll create shapes instead of loading images
    this.load.image('book', 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23E6B85C"%3E%3Cpath d="M4 4h16v16H4z"/%3E%3C/svg%3E');
    // Fallback: generate rectangle for book
}

function create() {
    const self = this;

    // Set world bounds
    this.physics.world.setBounds(0, 0, 1600, 400);
    this.cameras.main.setBounds(0, 0, 1600, 400);

    // Ground
    platforms = this.physics.add.staticGroup();
    platforms.create(0, 380, 'ground').setScale(20, 1).refreshBody();
    platforms.create(800, 380, 'ground').setScale(20, 1).refreshBody();

    // Player (a simple rectangle)
    player = this.physics.add.sprite(100, 320, 'book');
    player.setCollideWorldBounds(true);
    player.body.setGravityY(800);
    player.setSize(30, 40);
    player.setOffset(5, 5);
    normalHeight = 40;
    slideHeight = 20;

    // Collisions
    this.physics.add.collider(player, platforms);

    // Obstacles group
    obstacles = this.physics.add.group();
    books = this.physics.add.group();

    // Score display
    scoreText = this.add.text(16, 16, 'Score: 0', {
        fontFamily: 'JetBrains Mono',
        fontSize: '18px',
        fill: '#E6B85C'
    });
    scoreText.setScrollFactor(0);

    // Camera follow
    this.cameras.main.startFollow(player, true, 0.05, 0.05);
    this.cameras.main.setFollowOffset(-200, 0);

    // Input: keyboard
    cursors = this.input.keyboard.createCursorKeys();
    this.input.keyboard.on('keydown-UP', jump);
    this.input.keyboard.on('keydown-DOWN', slide);

    // Touch input
    this.input.on('pointerdown', (pointer) => {
        // If tap on book, we handle in update; but also capture swipe start
        swipeStartY = pointer.y;
    });
    this.input.on('pointerup', (pointer) => {
        const diff = swipeStartY - pointer.y;
        if (Math.abs(diff) > 30) {
            if (diff > 0) jump();
            else slide();
        }
    });
    // For mobile touch events on canvas
    const canvas = this.sys.canvas;
    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchend', handleTouchEnd);

    // Generate obstacles and books every 1.5 seconds
    this.time.addEvent({
        delay: 1500,
        callback: () => {
            if (player.x > 100) { // only when game is active
                // Obstacle
                const obs = obstacles.create(1600, 340, 'book');
                obs.setScale(0.5);
                obs.setSize(20, 20);
                obs.body.allowGravity = false;
                obs.body.setVelocityX(-200);
                // Book
                const book = books.create(1600, 300, 'book');
                book.setScale(0.3);
                book.body.allowGravity = false;
                book.body.setVelocityX(-200);
            }
        },
        loop: true
    });

    // Remove off-screen objects
    this.physics.add.overlap(player, books, collectBook, null, this);
    this.physics.add.collider(player, obstacles, hitObstacle, null, this);
}

function collectBook(player, book) {
    book.destroy();
    score += 10;
    scoreText.setText('Score: ' + score);
    // Add a little visual feedback (maybe a particle)
}

function hitObstacle(player, obstacle) {
    // End game: freeze everything and show game over
    this.physics.pause();
    player.setTint(0xff0000);
    this.add.text(player.x - 50, player.y - 50, 'GAME OVER', {
        fontFamily: 'JetBrains Mono',
        fontSize: '24px',
        fill: '#ff0000'
    }).setScrollFactor(0);
    this.input.keyboard.enabled = false;
    // Optionally restart button
    const restartText = this.add.text(300, 200, 'Tap to restart', {
        fontFamily: 'JetBrains Mono',
        fontSize: '18px',
        fill: '#E6B85C'
    }).setScrollFactor(0);
    restartText.setInteractive();
    restartText.on('pointerdown', () => {
        this.scene.restart();
    });
}

function update() {
    // Player movement: automatically runs forward (camera follows, so player stays centered)
    // We just keep the player's x position and move world? Actually we move obstacles left.
    // But we can also move the player right to simulate running.
    if (player.x < 1200) {
        player.setVelocityX(150);
    } else {
        player.setVelocityX(0);
    }
    // Ensure player doesn't go beyond bounds
    if (player.x > 1500) player.x = 1500;
    // Keep camera following player
}

// Start the game
window.addEventListener('load', () => {
    game = new Phaser.Game(config);
    // Expose game instance for debugging
});
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const playerScoreEl = document.getElementById('player-score');
const aiScoreEl = document.getElementById('ai-score');
const menu = document.getElementById('menu');
const gameOverScreen = document.getElementById('game-over');
const resultText = document.getElementById('result-text');
const scoreSummary = document.getElementById('score-summary');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const homeBtn = document.getElementById('home-btn');
const diffBtns = document.querySelectorAll('.diff-btn');

// Game constants and state
let gameRunning = false;
let difficulty = 'normal'; // easy, normal, hard
let playerY = 250;
let aiY = 250;
let ballX = 400;
let ballY = 300;
let ballSpeedX = 5;
let ballSpeedY = 5;
let playerScore = 0;
let aiScore = 0;

const PADDLE_HEIGHT = 100;
const PADDLE_WIDTH = 10;
const BALL_SIZE = 8;
const MAX_SCORE = 10;

// Difficulty configurations
const DIFF_CONFIG = {
    easy: { aiSpeed: 4, mistakeRate: 0.2 },
    normal: { aiSpeed: 6, mistakeRate: 0.08 },
    hard: { aiSpeed: 9, mistakeRate: 0.02 }
};

// Canvas responsiveness
function resizeCanvas() {
    canvas.width = 800;
    canvas.height = 600;
}
resizeCanvas();

// Input handling
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseY = e.clientY - rect.top;
    playerY = mouseY - PADDLE_HEIGHT / 2;

    // Bounds check
    if (playerY < 0) playerY = 0;
    if (playerY > canvas.height - PADDLE_HEIGHT) playerY = canvas.height - PADDLE_HEIGHT;
});

// Difficulty selection
diffBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        diffBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        difficulty = btn.dataset.level;
    });
});

startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);
homeBtn.addEventListener('click', showMenu);

function showMenu() {
    gameRunning = false;
    gameOverScreen.classList.add('hidden');
    menu.classList.remove('hidden');
    // Reset positions for visual preview
    playerY = 250;
    aiY = 250;
    ballX = 400;
    ballY = 300;
    draw();
}

function startGame() {
    playerScore = 0;
    aiScore = 0;
    updateScoreUI();
    menu.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    gameRunning = true;
    resetBall();
    requestAnimationFrame(gameLoop);
}

function resetBall() {
    ballX = canvas.width / 2;
    ballY = canvas.height / 2;
    ballSpeedX = (Math.random() > 0.5 ? 1 : -1) * 5;
    ballSpeedY = (Math.random() * 6 - 3);
}

function updateScoreUI() {
    playerScoreEl.textContent = playerScore;
    aiScoreEl.textContent = aiScore;
}

function drawRect(x, y, w, h, color, glow = false) {
    ctx.fillStyle = color;
    if (glow) {
        ctx.shadowBlur = 15;
        ctx.shadowColor = color;
    } else {
        ctx.shadowBlur = 0;
    }
    ctx.fillRect(x, y, w, h);
    ctx.shadowBlur = 0; // Reset
}

function drawCircle(x, y, r, color) {
    ctx.fillStyle = color;
    ctx.shadowBlur = 20;
    ctx.shadowColor = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.shadowBlur = 0;
}

function move() {
    if (!gameRunning) return;

    // Ball movement
    ballX += ballSpeedX;
    ballY += ballSpeedY;

    // Wall collision (top/bottom)
    if (ballY < 0 || ballY > canvas.height) {
        ballSpeedY = -ballSpeedY;
    }

    // AI logic
    const config = DIFF_CONFIG[difficulty];
    const aiCenter = aiY + PADDLE_HEIGHT / 2;

    // AI following with mistake rate
    if (Math.random() > config.mistakeRate) {
        if (aiCenter < ballY - 35) {
            aiY += config.aiSpeed;
        } else if (aiCenter > ballY + 35) {
            aiY -= config.aiSpeed;
        }
    }

    // AI Paddle bounds
    if (aiY < 0) aiY = 0;
    if (aiY > canvas.height - PADDLE_HEIGHT) aiY = canvas.height - PADDLE_HEIGHT;

    // Paddle collision
    // Player (left)
    if (ballX < PADDLE_WIDTH + 10) {
        if (ballY > playerY && ballY < playerY + PADDLE_HEIGHT) {
            ballSpeedX = -ballSpeedX;
            ballSpeedX *= 1.05; // Speed up
            const deltaY = ballY - (playerY + PADDLE_HEIGHT / 2);
            ballSpeedY = deltaY * 0.25;
        } else if (ballX < 0) {
            aiScore++;
            checkEndGame();
            resetBall();
        }
    }

    // AI (right)
    if (ballX > canvas.width - PADDLE_WIDTH - 10) {
        if (ballY > aiY && ballY < aiY + PADDLE_HEIGHT) {
            ballSpeedX = -ballSpeedX;
            ballSpeedX *= 1.05; // Speed up
            const deltaY = ballY - (aiY + PADDLE_HEIGHT / 2);
            ballSpeedY = deltaY * 0.25;
        } else if (ballX > canvas.width) {
            playerScore++;
            checkEndGame();
            resetBall();
        }
    }
}

function checkEndGame() {
    updateScoreUI();
    if (playerScore >= MAX_SCORE || aiScore >= MAX_SCORE) {
        gameRunning = false;
        gameOverScreen.classList.remove('hidden');
        resultText.textContent = playerScore >= MAX_SCORE ? "ARENA CONQUERED" : "NEURAL LINK LOST";
        scoreSummary.textContent = `${playerScore} - ${aiScore}`;
    }
}

function draw() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw center line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw paddles
    drawRect(10, playerY, PADDLE_WIDTH, PADDLE_HEIGHT, '#00f2ff', true);
    drawRect(canvas.width - PADDLE_WIDTH - 10, aiY, PADDLE_WIDTH, PADDLE_HEIGHT, '#7000ff', true);

    // Draw ball
    drawCircle(ballX, ballY, BALL_SIZE, '#fff');
}

function gameLoop() {
    if (!gameRunning) return;
    move();
    draw();
    requestAnimationFrame(gameLoop);
}

// Initial draw to show paddles
draw();

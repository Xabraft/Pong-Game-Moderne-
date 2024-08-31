const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 400;

const paddleWidth = 10;
const paddleHeight = 100;
const ballSize = 10;

let playerY = canvas.height / 2 - paddleHeight / 2;
let computerY = canvas.height / 2 - paddleHeight / 2;
let ballX = canvas.width / 2;
let ballY = canvas.height / 2;
let ballSpeedX = 2;
let ballSpeedY = 2;
const initialSpeed = 2;
const maxSpeed = 5;
const accelerationFactor = 1.01;

let playerScore = 0;
let computerScore = 0;

let lastTime = 0;
const fps = 60;
const frameInterval = 1000 / fps;

// Variables pour le contrôle du clavier
let upPressed = false;
let downPressed = false;
const paddleSpeed = 8;

// Variable pour le contrôle de la souris
let mouseY = playerY;

function drawRect(x, y, width, height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}

function drawCircle(x, y, radius, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2, false);
    ctx.fill();
}

function moveComputer() {
    const computerCenter = computerY + paddleHeight / 2;
    if (computerCenter < ballY - 35) {
        computerY += 4;
    } else if (computerCenter > ballY + 35) {
        computerY -= 4;
    }
}

function resetBall() {
    ballX = canvas.width / 2;
    ballY = canvas.height / 2;
    ballSpeedX = initialSpeed * (Math.random() > 0.5 ? 1 : -1);
    ballSpeedY = initialSpeed * (Math.random() * 2 - 1);
}

function accelerateBall() {
    ballSpeedX *= accelerationFactor;
    ballSpeedY *= accelerationFactor;
    
    ballSpeedX = Math.min(Math.abs(ballSpeedX), maxSpeed) * Math.sign(ballSpeedX);
    ballSpeedY = Math.min(Math.abs(ballSpeedY), maxSpeed) * Math.sign(ballSpeedY);
}

function update(deltaTime) {
    // Mise à jour de la position du joueur
    if (upPressed) {
        playerY = Math.max(0, playerY - paddleSpeed);
    }
    if (downPressed) {
        playerY = Math.min(canvas.height - paddleHeight, playerY + paddleSpeed);
    }

    // Utilisation de la position de la souris si elle a été déplacée récemment
    if (Math.abs(mouseY - playerY) > 1) {
        playerY += (mouseY - playerY) * 0.2;
    }

    // Assurer que la raquette reste dans les limites du canvas
    playerY = Math.max(0, Math.min(canvas.height - paddleHeight, playerY));

    ballX += ballSpeedX * (deltaTime / frameInterval);
    ballY += ballSpeedY * (deltaTime / frameInterval);

    if (ballY < 0 || ballY > canvas.height) {
        ballSpeedY = -ballSpeedY;
    }

    if (ballX < paddleWidth && ballY > playerY && ballY < playerY + paddleHeight) {
        ballSpeedX = -ballSpeedX;
        let deltaY = ballY - (playerY + paddleHeight / 2);
        ballSpeedY = deltaY * 0.2;
        accelerateBall();
    } else if (ballX > canvas.width - paddleWidth && ballY > computerY && ballY < computerY + paddleHeight) {
        ballSpeedX = -ballSpeedX;
        let deltaY = ballY - (computerY + paddleHeight / 2);
        ballSpeedY = deltaY * 0.2;
        accelerateBall();
    }

    if (ballX < 0) {
        computerScore++;
        document.getElementById('computerScore').textContent = computerScore;
        resetBall();
    } else if (ballX > canvas.width) {
        playerScore++;
        document.getElementById('playerScore').textContent = playerScore;
        resetBall();
    }

    moveComputer();
}

function draw() {
    ctx.fillStyle = '#16213e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.strokeStyle = 'rgba(233, 69, 96, 0.5)';
    ctx.stroke();
    
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#e94560';
    drawRect(0, playerY, paddleWidth, paddleHeight, '#e94560');
    drawRect(canvas.width - paddleWidth, computerY, paddleWidth, paddleHeight, '#e94560');
    
    ctx.beginPath();
    ctx.arc(ballX, ballY, ballSize, 0, Math.PI * 2);
    ctx.fillStyle = '#e94560';
    ctx.fill();
    
    ctx.shadowBlur = 0;
}

let gameStarted = false;

function startGame() {
    gameStarted = true;
    document.getElementById('start-screen').style.display = 'none';
    lastTime = performance.now();
    gameLoop();
}

document.getElementById('start-button').addEventListener('click', startGame);

function gameLoop(currentTime) {
    if (!gameStarted) return;

    const deltaTime = currentTime - lastTime;

    if (deltaTime >= frameInterval) {
        update(deltaTime);
        draw();
        lastTime = currentTime - (deltaTime % frameInterval);
    }

    requestAnimationFrame(gameLoop);
}

function keyDownHandler(e) {
    if (e.key === "ArrowUp" || e.key === "Up") {
        upPressed = true;
    } else if (e.key === "ArrowDown" || e.key === "Down") {
        downPressed = true;
    }
}

function keyUpHandler(e) {
    if (e.key === "ArrowUp" || e.key === "Up") {
        upPressed = false;
    } else if (e.key === "ArrowDown" || e.key === "Down") {
        downPressed = false;
    }
}

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

canvas.addEventListener('mousemove', (e) => {
    if (!gameStarted) return;
    const rect = canvas.getBoundingClientRect();
    mouseY = e.clientY - rect.top - paddleHeight / 2;
    mouseY = Math.max(0, Math.min(canvas.height - paddleHeight, mouseY));
});

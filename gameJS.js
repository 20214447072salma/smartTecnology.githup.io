// Set up the canvas
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Car properties
const car = {
    width: 50,
    height: 100,
    x: canvas.width / 2 - 25,
    y: canvas.height - 120,
    speed: 8
};

// Wall properties
let walls = [];
const wallWidth = 100;
const wallHeight = 20;
const wallSpeed = 3;

// Game variables
let score = 0;
let totalScore = 0;
let collisionPenalty = -5;
let scoreIncrease = 10;
let gameInterval, wallInterval;

// Start game
function startGame() {
    gameInterval = setInterval(updateGame, 1000 / 60); // Update the game 60 times per second
    wallInterval = setInterval(createWall, 2000); // Create new walls every 2 seconds
}

// Create walls
function createWall() {
    let wallX = Math.random() * (canvas.width - wallWidth);
    walls.push({ x: wallX, y: 0 });
}

// Update game logic
function updateGame() {
    clearCanvas();
    moveWalls();
    drawCar();
    checkCollisions();
    updateScore();
    document.getElementById('score').innerText = `Score: ${score}`;
}

// Move walls
function moveWalls() {
    walls.forEach((wall, index) => {
        wall.y += wallSpeed;
        if (wall.y > canvas.height) {
            walls.splice(index, 1);
        }
        drawWall(wall);
    });
}

// Draw car
function drawCar() {
    ctx.fillStyle = 'blue';
    ctx.fillRect(car.x, car.y, car.width, car.height);
}

// Draw wall
function drawWall(wall) {
    ctx.fillStyle = 'red';
    ctx.fillRect(wall.x, wall.y, wallWidth, wallHeight);
}

// Check for collisions
function checkCollisions() {
    walls.forEach((wall) => {
        if (
            car.x < wall.x + wallWidth &&
            car.x + car.width > wall.x &&
            car.y < wall.y + wallHeight &&
            car.y + car.height > wall.y
        ) {
            score += collisionPenalty; // Deduct points for collisions
            wall.y = canvas.height + 1; // Move the wall off-screen after collision
        }
    });
}

// Update score
function updateScore() {
    score += scoreIncrease / 60; // Add points over time
}

// Clear canvas
function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Handle car movement
window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' && car.x > 0) {
        car.x -= car.speed;
    }
    if (e.key === 'ArrowRight' && car.x < canvas.width - car.width) {
        car.x += car.speed;
    }
});

// End game
function endGame() {
    clearInterval(gameInterval);
    clearInterval(wallInterval);
    totalScore = Math.floor(score);
    alert(`Game Over! Total Score: ${totalScore}`);
    saveScore(totalScore); // Save the score to the database
}

// Automatically end the game after 60 seconds
setTimeout(endGame, 30000);

// Start the game
startGame();

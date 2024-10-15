// Get the URL parameters
const urlParams = new URLSearchParams(window.location.search);

// Extract the user_id from the URL
const user_id = urlParams.get('user_id');

// Check if the user_id is available
if (!user_id) {
    alert("Error: user ID not found");
} else {
    alert("success: user ID found");
}

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
const wallSpeed = 10;

// Game variables
let score = 0;
let totalScore = 0;
let collisionPenalty = -20;
let scoreIncrease = 10;
let gameInterval, wallInterval;

const wallImage = new Image();
wallImage.src = 'images/wall.png';

// Start game
function startGame() {
    gameInterval = setInterval(updateGame, 1000 / 60); // Update the game 60 times per second
    wallInterval = setInterval(createWall, 500); // Create new walls every 0.5 seconds
}

// Create walls
function createWall() {
    /* 
        the position of the wall in the screen is in random position
        random to get random position * canvas W - wallWidth to suggest
        number in the range of window size :) easy
    */
    let wallX = Math.random() * (canvas.width - wallWidth);  

    // move only in x-axis
    walls.push({ x: wallX, y: 0 });
}

// Update game logic
function updateGame() {
    clearCanvas();
    moveWalls();
    drawCar();
    checkCollisions();
    updateScore();
    document.getElementById('score').innerText = `Score: ${Math.floor(score)}`;
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
    if (wallImage.complete) {  // Check if the image is loaded
        ctx.drawImage(wallImage, wall.x, wall.y, wallWidth, wallHeight);
    } else {
        // Draw the rectangle as a fallback while the image is loading
        ctx.fillStyle = 'red';
        ctx.fillRect(wall.x, wall.y, wallWidth, wallHeight);
    }
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

// Handle car movement with keyboard
window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' && car.x > 0) {
        car.x -= car.speed;
    }
    if (e.key === 'ArrowRight' && car.x < canvas.width - car.width) {
        car.x += car.speed;
    }
});

// Handle car movement with touch
canvas.addEventListener('touchstart', (e) => {
    const touchX = e.touches[0].clientX;
    
    // Move car based on where the user touched (left or right side of the screen)
    if (touchX < canvas.width / 2) {
        car.x -= car.speed * 5; // Move left
    } else {
        car.x += car.speed * 5; // Move right
    }
});

canvas.addEventListener('touchmove', (e) => {
    const touchX = e.touches[0].clientX;

    // Move the car to follow the finger's position
    car.x = touchX - car.width / 2;

    // Prevent the car from going off the screen
    if (car.x < 0) car.x = 0;
    if (car.x > canvas.width - car.width) car.x = canvas.width - car.width;

    e.preventDefault(); // Prevent scrolling while playing
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

function saveScore(score) {
    fetch('http://localhost:8081/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            user_id: user_id,  // Send user ID from Telegram bot
            score: score       // Send the total score
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Score saved successfully:', data);
    })
    .catch(error => {
        console.error('Error saving score:', error);
    });
}

// Start the game
startGame();

// Get the URL parameters 
const urlParams = new URLSearchParams(window.location.search);

// Extract the user_id from the URL
const user_id = urlParams.get('user_id');

// Check if the user_id is available
if (!user_id) {
    alert("Error: user ID not found");
} else {
    alert("Success: user ID found");
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
    
    if (touchX < canvas.width / 2) {
        car.x -= car.speed * 5; // Move left
    } else {
        car.x += car.speed * 5; // Move right
    }
});

canvas.addEventListener('touchmove', (e) => {
    const touchX = e.touches[0].clientX;

    car.x = touchX - car.width / 2;
    
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

// Automatically end the game after 30 seconds
setTimeout(endGame, 30000);

// Save score to the server
function saveScore(score) {
    alert(`Score: ${score}`);
    alert(`userid: ${user_id}`);

    fetch('http://127.0.0.1:8081/update_score', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            user_id: user_id,  // Make sure user_id is defined in your scope
            score: score       // Ensure score is passed correctly
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        alert('Score saved successfully: ' + JSON.stringify(data));
    })
    .catch(error => {
        alert('Error saving score: ' + error.message);
    });
    alert("done");
}

// Start the game
startGame();

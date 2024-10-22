// Get the URL parameters
const urlParams = new URLSearchParams(window.location.search);

// Extract the user_id from the URL
const user_id = urlParams.get('user_id');

// Check if the user_id is available
// if (!user_id) {
//     alert("Error: user ID not found");
// } else {
//     alert("success: user ID found");

// }

// Set up the canvas
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// basket properties
const basket = {
    width: 100,
    height: 100,
    x: canvas.width / 2 - 25,
    y: canvas.height - 100,
    speed: 8
};

// Wall properties
let walls = [];
const wallWidth  = 100;
const wallHeight = 20;
const wallSpeed  = 10;

// Game variables
let score         = 0;
let totalScore    = 0;
let collision     = 5;
let scoreIncrease = 1;
let out           = -5;
let timeLeft      = 30;   
let gameInterval, wallInterval, timerInterval;

// Images of the game 
const wallImage = new Image();
wallImage.src = 'images/wall.png';

const basketImage = new Image();
basketImage.src = 'images/basket.png';

// Start game
function startGame() {
    gameInterval  = setInterval(updateGame, 1000 / 60); // Update the game 60 times per second
    wallInterval  = setInterval(createWall, 500);      // Create new walls every 0.5 seconds
    timerInterval = setInterval(updateTimer, 1000)    // Update the timer every second
}

// Update the timer
function updateTimer() {
    timeLeft--;
    document.getElementById('timer').innerText = `00: ${timeLeft}`;

    if (timeLeft < 10 && timeLeft >= 0) {
        document.getElementById('timer').innerText = `00: 0${timeLeft}`;
    }

    else if (timeLeft <= 0) {
        endGame();  // End the game when the timer runs out
    }
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
    drawBasket();
    checkCollisionsAndBounds(); // Check for collisions
    // checkOutOfBounds(); // Check if walls are out of bounds
    updateScore();
    document.getElementById('score').innerText = `Score: ${Math.floor(score)}`;
}

// Move walls
function moveWalls() {
    walls.forEach((wall, index) => {
        wall.y += wallSpeed;
        if (wall.y > canvas.height) {
            walls.splice(index, 1);
            score += out;
            if (score < 0) {
                score = 0;
            }
        }
        drawWall(wall);
    });
}

// Draw basket
function drawBasket() {
    if(basketImage.complete) { 
        // Check if the image is loaded
        ctx.drawImage(basketImage, basket.x, basket.y, basket.width, basket.height);
    } else { 
        // Draw the rectange as a fallback while the image is loading 
        ctx.fillStyle = 'brawn';
        ctx.fillRect(basket.x, basket.y, basket.width, basket.height);
    } 
}

// Draw wall
function drawWall(wall) {
    if (wallImage.complete) {  
        // Check if the image is loaded
        ctx.drawImage(wallImage, wall.x, wall.y, wallWidth, wallHeight);
    } else {
        // Draw the rectangle as a fallback while the image is loading
        ctx.fillStyle = 'red';
        ctx.fillRect(wall.x, wall.y, wallWidth, wallHeight);
    }
}

// Check for collisions and out of bounds walls
function checkCollisionsAndBounds() {
    walls.forEach((wall, index) => {
        // Check for collision with the basket
        if (
            basket.x < wall.x + wallWidth &&
            basket.x + basket.width > wall.x &&
            basket.y < wall.y + wallHeight &&
            basket.y + basket.height > wall.y
        ) {
            // Increase score for collision
            score += collision;
            walls.splice(index, 1); // Remove the wall after collision
        }
    });
}

function checkOutOfBounds() {
    walls.forEach((wall, index) => {
        // Check if the wall has moved off the bottom of the screen
        if (wall.y > canvas.height) {
            // Decrease score if the wall passes out of the screen without collision
            score += out;
            walls.splice(index, 1); // Remove the wall once it goes out of the screen
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

// Handle basket movement with keyboard
window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' && basket.x > 0) {
        basket.x -= basket.speed;
    }
    if (e.key === 'ArrowRight' && basket.x < canvas.width - basket.width) {
        basket.x += basket.speed;
    }
});

// Handle basket movement with touch
canvas.addEventListener('touchstart', (e) => {
    const touchX = e.touches[0].clientX;
    
    // Move basket based on where the user touched (left or right side of the screen)
    if (touchX < canvas.width / 2) {
        basket.x += basket.speed * 5; // Move left
    } else {
        basket.x -= basket.speed * 5; // Move right
    }
});

canvas.addEventListener('touchmove', (e) => {
    const touchX = e.touches[0].clientX;

    // Move the basket to follow the finger's position
    basket.x = touchX - basket.width / 2;

    // Prevent the basket from going off the screen
    if (basket.x < 0) basket.x = 0;
    if (basket.x > canvas.width - basket.width) basket.x = canvas.width - basket.width;

    e.preventDefault(); // Prevent scrolling while playing
});

// End game
function endGame() {
    clearInterval(gameInterval);
    clearInterval(wallInterval);
    clearInterval(timerInterval);  // Stop the timer
    totalScore = Math.floor(score);
    alert(`Game Over! Total Score: ${totalScore}`);
    saveScore(totalScore); // Save the score to the database
}

// Automatically end the game after 30 seconds
setTimeout(endGame, timeLeft * 1000);

function saveScore(score) {
    // alert(`Score: ${score}`);
    // alert(`userid: ${user_id}`);

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
    // alert("done");
}

// Start the game
startGame();

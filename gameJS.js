// Get the URL parameters
const urlParams = new URLSearchParams(window.location.search);

// Extract the user_id from the URL
const user_id = urlParams.get('user_id');

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

// Robot properties
let robots = [];
const robotWidth  = 30;
const robotHeight = 37;
const robotSpeed  = 10;

// Game variables
let score         = 0;
let totalScore    = 0;
let collision     = 1;
let scoreIncrease = 1;
let out           = -1;
let timeLeft      = 30;   
let gameInterval, robotInterval, timerInterval;

// Images of the game 
const robotImage = new Image();
robotImage.src = 'images/logo.png';

const imageOne = new Image();
imageOne.src = 'images/1.png';
const imageTwo = new Image();
imageTwo.src = 'images/2.png';
const imageThere = new Image();
imageThere.src = 'images/3.png';
const imageFour = new Image();
imageFour.src = 'images/4.png';
const imageFive = new Image();
imageFive.src = 'images/5.png';
const imageSix = new Image();
imageSix.src = 'images/6.png';
const imageSeven = new Image();
imageSeven.src = 'images/7.png';

const basketImage = new Image();
basketImage.src = 'images/basket.png';

// Start game
function startGame() {
    gameInterval  = setInterval(updateGame, 1000 / 60); // Update the game 60 times per second
    robotInterval  = setInterval(createrobot, 100);    // Create new robots every 0.5 seconds
    timerInterval = setInterval(updateTimer, 1000)    // Update the timer every second
}

// Update the timer
function updateTimer() {
    timeLeft--;
    document.getElementById('timer').innerText = `00:${timeLeft}`;

    if (timeLeft < 10 && timeLeft >= 0) {
        document.getElementById('timer').innerText = `00:0${timeLeft}`;
    }

    else if (timeLeft <= 0) {
        endGame();  // End the game when the timer runs out
    }
}

// Create robots
function createrobot() {
    /* 
        the position of the robot in the screen is in random position
        random to get random position * canvas W - robotWidth to suggest
        number in the range of window size :) easy
    */
    let robotX = Math.random() * (canvas.width - robotWidth);  

    // move only in x-axis
    robots.push({ x: robotX, y: 0 });
}

// Update game logic
function updateGame() {
    clearCanvas();
    moveRobots();
    drawBasket();
    checkCollisionsAndBounds(); // Check for collisions
    updateScore();
    document.getElementById('score').innerText = `Score: ${Math.floor(score)}`;
}

// Move robots
function moveRobots() {
    robots.forEach((robot, index) => {
        robot.y += robotSpeed;
        if (robot.y > canvas.height) {
            robots.splice(index, 1);
            score += out;
            if (score < 0) {
                score = 0;
            }
        }
        drawRobot(robot);
    });
}

// Draw basket
function drawBasket() {
    if(basketImage.complete) {     // Check if the image is loaded

        if(score <= 10) {
            ctx.drawImage(basketImage, basket.x, basket.y, basket.width, basket.height);
        } else if(score > 10 && score <= 25) {
            ctx.drawImage(imageOne, basket.x, basket.y, basket.width, basket.height);
        } else if(score > 25 && score <= 50) {
            ctx.drawImage(imageTwo, basket.x, basket.y, basket.width, basket.height);
        } else if(score > 50 && score <= 75) {
            ctx.drawImage(imageThere, basket.x, basket.y, basket.width, basket.height);
        } else if(score > 75 && score <= 100) {
            ctx.drawImage(imageFour, basket.x, basket.y, basket.width, basket.height);
        } else if(score > 100 && score <= 125) {
            ctx.drawImage(imageFive, basket.x, basket.y, basket.width, basket.height);
        } else if(score > 125 && score <= 150) {
            ctx.drawImage(imageSix, basket.x, basket.y, basket.width, basket.height);
        } else {
            ctx.drawImage(imageSeven, basket.x, basket.y, basket.width, basket.height);
        }

    } else { 
        // Draw the rectange as a fallback while the image is loading 
        ctx.fillStyle = 'brawn';
        ctx.fillRect(basket.x, basket.y, basket.width, basket.height);
    } 
}

// Draw Robot
function drawRobot(robot) {
    if (robotImage.complete) {  
        // Check if the image is loaded
        ctx.drawImage(robotImage, robot.x, robot.y, robotWidth, robotHeight);
    } else {
        // Draw the rectangle as a fallback while the image is loading
        ctx.fillStyle = 'green';
        ctx.fillRect(robot.x, robot.y, robotWidth, robotHeight);
    }
}

// Check for collisions and out of bounds robots
function checkCollisionsAndBounds() {
    robots.forEach((robot, index) => {
        // Check for collision with the basket
        if (
            basket.x < robot.x + robotWidth &&
            basket.x + basket.width > robot.x &&
            basket.y < robot.y + robotHeight &&
            basket.y + basket.height > robot.y
        ) {
            // Increase score for collision
            score += collision;
            robots.splice(index, 1); // Remove the robot after collision
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
    clearInterval(robotInterval);
    clearInterval(timerInterval);  // Stop the timer
    totalScore = Math.floor(score);
    alert(`Game Over! Total Score: ${totalScore}`);
    saveScore(totalScore); // Save the score to the database

    setTimeout(() => {
        window.location.href = `home.html?user_id=${user_id}`;  // Replace 'home.html' with your actual home file path
    }, 2000);                               // Delay of 2 seconds 
}

// Automatically end the game after 30 seconds
setTimeout(endGame, timeLeft * 1000);

function saveScore(score) {

    fetch('http://127.0.0.1:8081/update_score', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            user_id: user_id,  // Make sure user_id is defined in your scope
            score: score,       // Ensure score is passed correctly
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

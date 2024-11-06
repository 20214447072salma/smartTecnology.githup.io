const urlParams = new URLSearchParams(window.location.search);
const user_id = urlParams.get('user_id');

const list = document.querySelectorAll('.list');
function activeLink() {
    list.forEach((item) => item.classList.remove('active'));
    this.classList.add('active');
}
list.forEach((item) => item.addEventListener('click', activeLink));

let heartsLeft = 3;
let timerhours = 4;
let timerMinutes = 59;
let timerSeconds = 59;
let timerInterval;

// Function to update the timer on screen and in the database
function updateTimerDisplay() {
    document.getElementById('timer').innerText = `${formatTime(timerhours)}:${formatTime(timerMinutes)}:${formatTime(timerSeconds)}`;
}

function decrementTimer() {
    if (timerSeconds > 0) {
        timerSeconds--;
    } else if (timerMinutes > 0) {
        timerMinutes--;
        timerSeconds = 59;
    } else if (timerhours > 0) {
        timerhours--;
        timerMinutes = 59;
        timerSeconds = 59;
    } else {
        clearInterval(timerInterval); // Stop timer when it reaches 0
        alert("Time is up! You can play again with three hearts.");
        resetHearts();
    }
    updateTimerDisplay();
    const remainingTimeInSeconds = timerhours * 3600 + timerMinutes * 60 + timerSeconds;
    updateTimer(remainingTimeInSeconds); // Update timer in database
}

// Helper function to format time (add leading zero if needed)
function formatTime(unit) {
    return unit < 10 ? `0${unit}` : unit;
}

// Function to start the timer countdown
function startTimerCountdown() {
    if (!timerInterval) {
        timerInterval = setInterval(decrementTimer, 1000); // Decrement every second
    }
}

// Function to start the game
function startGame() {
    if (heartsLeft > 0) {
        if (user_id) {
            // Redirect to play.html with the user_id
            // window.location.href = `play.html?user_id=${user_id}`;
            alert("found");
        } else {
            // alert("Error: user ID not found.");
            // window.location.href = `play.html`;
        }
        heartsLeft--; // Decrement hearts by 1 for each play

        updateHeart(heartsLeft);

        // Update the heart status on the screen
        document.getElementById('heartStatus').innerText = `Hearts Left: ${heartsLeft}`;
    }
}

// Play button event listener
document.getElementById('playButton').addEventListener('click', function () {
    startGame();
    if (heartsLeft === 0) {
        document.getElementById('heartStatus').innerText = `Hearts Left: 0`;
        if (!timerInterval) {
            timerInterval = setInterval(updateTimer, 1000);  // Update the timer every second
        }
    }
});

// Reset hearts and timer after 5 hours
function resetHearts() {
    heartsLeft = 3;  // Reset the hearts to 3 after 5 hours
    clearInterval(timerInterval);  // Clear the existing interval
    timerhours = 4;
    timerMinutes = 59;
    timerSeconds = 59;
    timerInterval = null;

    updateHeart(heartsLeft); // Update heart count in database

    const remainingTimeInSeconds = timerhours * 3600 + timerMinutes * 60 + timerSeconds;
    updateTimer(remainingTimeInSeconds); // Reset timer in database

    document.getElementById('heartStatus').innerText = `Hearts Left: ${heartsLeft}`;
    updateTimerDisplay();
}

// Fetch user info from the database when the page loads
async function fetchUserInfo() {
    try {
        const response = await fetch(`http://127.0.0.1:8081/get_user_info/${user_id}`);
        if (response.ok) {
            const data = await response.json();
            if (data.status === 'success') {
                heartsLeft = data.data.heart;
                const totalSeconds = data.data.timer;
                timerhours = Math.floor(totalSeconds / 3600);
                timerMinutes = Math.floor((totalSeconds % 3600) / 60);
                timerSeconds = totalSeconds % 60;
                document.getElementById('heartStatus').innerText = `Hearts Left: ${heartsLeft}`;
                document.getElementById('totalScore').innerText = "Total score: " + data.data.score;
                updateTimerDisplay();
            } else {
                alert('User not found');
            }
        } else {
            alert('Failed to fetch user info');
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

function updateTimer(timerInSeconds) {
    fetch('http://127.0.0.1:8081/update_timer', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            user_id: user_id,
            timer: timerInSeconds
        })
    })
    .then(response => response.json())
    .then(data => {
        alert('Timer updated successfully: ' + JSON.stringify(data));
    })
    .catch(error => {
        alert('Error updating timer: ' + error.message);
    });
}

function updateHeart(heartsLeft) {
    fetch('http://127.0.0.1:8081/update_heart', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            user_id: user_id,
            heart: heartsLeft
        })
    })
    .then(response => response.json())
    .then(data => {
        alert('Heart updated successfully: ' + JSON.stringify(data));
    })
    .catch(error => {
        alert('Error updating heart: ' + error.message);
    });
}

// Call fetchUserInfo when the page loads
window.onload = fetchUserInfo;

setTimeout(resetHearts, 5 * 60 * 60 * 1000); // 5 hours in milliseconds

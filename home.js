const urlParams = new URLSearchParams(window.location.search);
const user_id = urlParams.get('user_id');

const list = document.querySelectorAll('.list');
function activeLink() {
    list.forEach((item) => item.classList.remove('active'));
    this.classList.add('active');
}
list.forEach((item) => item.addEventListener('click', activeLink));

let heartsLeft;
let timerhours;
let timerMinutes;
let timerSeconds;
let timerInterval;

// Function to update the timer
function updateTimer() {
    // Update timer on the screen
    document.getElementById('timer').innerText = `${formatTime(timerhours)}:${formatTime(timerMinutes)}:${formatTime(timerSeconds)}`;
    
    // Decrement the time
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
        clearInterval(timerInterval); // Stop the timer once it reaches 0:00:00
        alert("Time is up! You can play again with three hearts.");
        resetHearts();
    }
}

// Helper function to format time (add leading zero if needed)
function formatTime(unit) {
    return unit < 10 ? `0${unit}` : unit;
}

// Function to start the game
function startGame() {
    if (heartsLeft > 1) {
        if (user_id) {
            // Redirect to play.html with the user_id
            window.location.href = `play.html?user_id=${user_id}`;
            alert("found");
        } else {
            // alert("Error: user ID not found.");
            window.location.href = `play.html`;
        }
        heartsLeft--; // Decrement hearts by 1 for each play

        document.getElementById('heartStatus').innerText = `Hearts Left: ${heartsLeft}`;

    } else {
        // Start 5-hour timer after the user has used up all hearts
        document.getElementById('heartStatus').innerText = `Hearts Left: 0`;
        if (!timerInterval) {
            timerInterval = setInterval(updateTimer, 1000);  // Update the timer every second
        }
    }
}

// Play button event listener
document.getElementById('playButton').addEventListener('click', function () {
    startGame();
});

// Reset hearts and timer after 5 hours
function resetHearts() {
    heartsLeft = 3;  // Reset the hearts to 3 after 5 hours
    clearInterval(timerInterval);  // Clear the existing interval
    timerhours = 4;
    timerMinutes = 59;
    timerSeconds = 59;
    timerInterval = null;
    document.getElementById('heartStatus').innerText = `Hearts Left: ${heartsLeft}`;
    document.getElementById('timer').innerText = `${formatTime(timerhours)}:${formatTime(timerMinutes)}:${formatTime(timerSeconds)}`;
}

// Function to fetch user info, including heart and timer values, from the database
async function fetchUserInfo() {
    alert(`User ID: ${user_id}`);
    try {
        const response = await fetch(`http://127.0.0.1:8081/get_user_info/${user_id}`);
        if (response.ok) {
            const data = await response.json();
            if (data.status === 'success') {
                heartsLeft = data.data.heart;
                timerhours = Math.floor(data.data.timer / 3600);
                timerMinutes = Math.floor((data.data.timer % 3600) / 60);
                timerSeconds = data.data.timer % 60;

                document.getElementById('heartStatus').innerText = "Hearts Left: " + data.data.heart;
                document.getElementById('timer').innerText = `${formatTime(timerhours)}:${formatTime(timerMinutes)}:${formatTime(timerSeconds)}`;
                document.getElementById('totalScore').innerText = "Total score: " + data.data.score;
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

// Call fetchUserInfo when the page loads
window.onload = fetchUserInfo;

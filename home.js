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
        clearInterval(timerInterval);
        alert("Time is up! You can play again with three hearts.");
        resetHearts();
    }

    updateTimerDisplay();

    // Update timer in database every 60 seconds
    if (timerSeconds % 60 === 0) {
        const remainingTimeInSeconds = timerhours * 3600 + timerMinutes * 60 + timerSeconds;
        sendTimerToDatabase(remainingTimeInSeconds);
    }
}

function formatTime(unit) {
    return unit < 10 ? `0${unit}` : unit;
}

function startGame() {
    if (heartsLeft > 0) {
        if (user_id) {
            alert("User ID found");
        } else {
            alert("Error: User ID not found.");
        }
        heartsLeft--;
        updateHeart(heartsLeft);
        document.getElementById('heartStatus').innerText = `Hearts Left: ${heartsLeft}`;
    }
}

// Play button event listener
document.getElementById('playButton').addEventListener('click', function () {
    startGame();
    if (heartsLeft === 0) {
        document.getElementById('heartStatus').innerText = `Hearts Left: 0`;
        if (!timerInterval) {
            timerInterval = setInterval(decrementTimer, 1000);  // Update the timer every second
        }
    }
});

function resetHearts() {
    heartsLeft = 3;
    clearInterval(timerInterval);
    timerhours = 4;
    timerMinutes = 59;
    timerSeconds = 59;
    timerInterval = null;

    updateHeart(heartsLeft);
    sendTimerToDatabase(timerhours * 3600 + timerMinutes * 60 + timerSeconds);

    document.getElementById('heartStatus').innerText = `Hearts Left: ${heartsLeft}`;
    updateTimerDisplay();
}

async function fetchUserInfo() {
    if (!user_id) {
        alert("User ID is missing.");
        return;
    }
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

function sendTimerToDatabase(timerInSeconds) {
    const hours = Math.floor(timerInSeconds / 3600);
    const minutes = Math.floor((timerInSeconds % 3600) / 60);
    const seconds = timerInSeconds % 60;
    const timerFormatted = `${formatTime(hours)}:${formatTime(minutes)}:${formatTime(seconds)}`;

    fetch('http://127.0.0.1:8081/update_timer', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            user_id: user_id,
            timer: timerFormatted
        })
    })
    .then(response => response.json())
    .then(data => {
        alert('timer updated successfully: ' + JSON.stringify(data));
    })
    .catch(error => {
        alert('Error update timer: ' + error.message);
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
        alert('heart updated successfully: ' + JSON.stringify(data));
    })
    .catch(error => {
        alert('Error update heart: ' + error.message);
    });
}

window.onload = fetchUserInfo;
setTimeout(resetHearts, 5 * 60 * 60 * 1000); // Reset after 5 hours

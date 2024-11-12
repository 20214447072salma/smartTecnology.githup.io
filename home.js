const urlParams = new URLSearchParams(window.location.search);
const user_id = urlParams.get('user_id');

const list = document.querySelectorAll('.list');
function activeLink() {
    list.forEach((item) => item.classList.remove('active'));
    this.classList.add('active');
}
list.forEach((item) => item.addEventListener('click', activeLink));

let heartsLeft = 3;
let timerInterval;

function updateTimerDisplay(hours, minutes, seconds) {
    document.getElementById('timer').innerText = `${formatTime(hours)}:${formatTime(minutes)}:${formatTime(seconds)}`;
}

function startCountdown(endTime) {
    timerInterval = setInterval(() => {
        const now = new Date();
        const timeLeft = Math.max((endTime - now) / 1000, 0);

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            resetHearts();
        } else {
            const hours = Math.floor(timeLeft / 3600);
            const minutes = Math.floor((timeLeft % 3600) / 60);
            const seconds = Math.floor(timeLeft % 60);
            updateTimerDisplay(hours, minutes, seconds);
        }
    }, 1000);
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
            const endTime = new Date(Date.now() + 5 * 60 * 60 * 1000);  // 5 hours from now
            sendTimerToDatabase(endTime.toISOString());
            startCountdown(endTime);
        }
    }
});

function resetHearts() {
    heartsLeft = 3;
    updateHeart(heartsLeft);

    const newEndTime = new Date(Date.now() + 5 * 60 * 60 * 1000); // 5 hours from now
    sendTimerToDatabase(newEndTime.toISOString());
    startCountdown(newEndTime);
    updateTimerDisplay(5, 0, 0);
}

async function fetchUserInfo() {
    try {
        const response = await fetch(`http://127.0.0.1:8081/get_user_info/${user_id}`);
        const data = await response.json();
        
        if (data.status === 'success') {
            const now = new Date();
            const endTime = new Date(data.data.end_time);
            heartsLeft = data.data.heart;
            const remainingSeconds = Math.max((endTime - now) / 1000, 0);

            document.getElementById('heartStatus').innerText = `Hearts Left: ${heartsLeft}`;
            if (remainingSeconds > 0) {
                startCountdown(endTime);
            } else {
                resetHearts();
            }
        }
    } catch (error) {
        console.error('Error fetching user info:', error);
    }
}

function sendTimerToDatabase(endTime) {
    fetch('http://127.0.0.1:8081/update_timer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id, timer: endTime })
    }).then(response => response.json())
      .then(data => console.log('Timer updated:', data))
      .catch(error => console.error('Error updating timer:', error));
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

window.onload = fetchUserInfo;

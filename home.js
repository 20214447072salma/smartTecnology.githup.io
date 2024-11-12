const urlParams = new URLSearchParams(window.location.search);
const user_id = urlParams.get('user_id');

const list = document.querySelectorAll('.list');
function activeLink() {
    list.forEach((item) => item.classList.remove('active'));
    this.classList.add('active');
}
list.forEach((item) => item.addEventListener('click', activeLink));

let heartsLeft = 3;
let timerhours = 0;
let timerMinutes = 1;
let timerSeconds = 0;
let timerInterval;

function updateTimerDisplay() {
    document.getElementById('timer').innerText = `${formatTime(timerhours)}:${formatTime(timerMinutes)}:${formatTime(timerSeconds)}`;
}

async function decrementTimer() {
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

    if (timerSeconds === 0 && timerMinutes % 1 === 0) {
        const remainingTimeInSeconds = timerhours * 3600 + timerMinutes * 60 + timerSeconds;
        sendTimerToDatabase(remainingTimeInSeconds);
    }
}


function formatTime(unit) {
    return unit < 10 ? `0${unit}` : unit;
}

async function startGame() {
    if (heartsLeft > 0) {
        if (user_id) {
            // Redirect to play.html with the user_id
            // window.location.href = `play.html?user_id=${user_id}`;
            // alert("found");
        } else {
            // alert("Error: user ID not found.");
            // window.location.href = play.html;
        }
        heartsLeft--;
        updateHeart(heartsLeft);
        document.getElementById('heartStatus').innerText = `Hearts Left: ${heartsLeft}`;
    }

    const response = await fetchUserInfo();  // Ensure you get the latest `next` value from the database
    const nextTime = new Date(response.data.timer).getTime();  // Convert `next` time to milliseconds
    alert(nextTime)
    const currentTime = Date.now();  // Current time in milliseconds

    if (currentTime >= nextTime) {
        // Condition to start a new 8-hour countdown if the current time is past the next time
        resetHearts(); 
        sendNextToDatabase();  // Set the next 8-hour time in the database
    }
}

function resetHearts() {
    heartsLeft = 3;
    updateHeart(heartsLeft);
    document.getElementById('heartStatus').innerText = `Hearts Left: ${heartsLeft}`;
}

function resetTimer() {
    clearInterval(timerInterval);
    timerhours = 0;
    timerMinutes = 1;
    timerSeconds = 0;
    timerInterval = null;

    const remainingTimeInSeconds = timerhours * 3600 + timerMinutes * 60 + timerSeconds;
    sendTimerToDatabase(remainingTimeInSeconds); // Pass updated `next`
    updateTimerDisplay();
}

async function fetchUserInfo() {
    if (!user_id) {
        // alert("User ID is missing.");
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

                const next = data.data.next;
                hours = Math.floor(next / 3600);
                Minutes = Math.floor((next % 3600) / 60);
                Seconds = next % 60;

            } else {
                // alert('User not found');
            }
        } else {
            // alert('Failed to fetch user info');
        }
    } catch (error) {
        // alert('Error: ' + error.message);
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
            timer: timerFormatted, 
        })
    })
    .then(response => response.json())
    .then(data => {
        // alert('timer updated successfully: ' + JSON.stringify(data));
    })
    .catch(error => {
        // alert('Error update timer: ' + error.message);
    });
}

function sendNextToDatabase() {
    const nextEndTime = new Date(Date.now() + 1 * 60 * 1000); // Adjust time as needed
    const totalSeconds = Math.floor((nextEndTime - Date.now()) / 1000); // Calculate in seconds

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const timerFormatted = `${formatTime(hours)}:${formatTime(minutes)}:${formatTime(seconds)}`;

    fetch('http://127.0.0.1:8081/update_next', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            user_id: user_id,
            next: timerFormatted
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Next timer updated successfully:', data);
    })
    .catch(error => {
        console.error('Error updating next timer:', error.message);
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
        // alert('heart updated successfully: ' + JSON.stringify(data));
    })
    .catch(error => {
        // alert('Error update heart: ' + error.message);
    });
}

window.onload = fetchUserInfo;
// setTimeout(resetHearts, 3 * 1000); // Reset after 5 hours

// Play button event listener
document.getElementById('playButton').addEventListener('click', async function () {
    
    await startGame();

    await fetchUserInfo();

    const remainingTimeInSeconds = timerhours * 3600 + timerMinutes * 60 + timerSeconds;
    sendTimerToDatabase(remainingTimeInSeconds);
    updateTimerDisplay();

    await fetchUserInfo();
});

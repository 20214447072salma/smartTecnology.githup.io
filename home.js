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

// async function decrementTimer() {
//     if (timerSeconds > 0) {
//         timerSeconds--;
//     } else if (timerMinutes > 0) {
//         timerMinutes--;
//         timerSeconds = 59;
//     } else if (timerhours > 0) {
//         timerhours--;
//         timerMinutes = 59;
//         timerSeconds = 59;
//     } else {
//         clearInterval(timerInterval);
//         alert("Time is up! You can play again with three hearts.");
//         resetHearts();
//     }

//     updateTimerDisplay();

//     if (timerSeconds === 0 && timerMinutes % 1 === 0) {
//         const remainingTimeInSeconds = timerhours * 3600 + timerMinutes * 60 + timerSeconds;
//         sendTimerToDatabase(remainingTimeInSeconds);
//     }
// }


function formatTime(unit) {
    return unit < 10 ? `0${unit}` : unit;
}

async function startGame() {
    if (heartsLeft > 0) {
        if (user_id) {
            // Redirect to play.html with the user_id
            window.location.href = `play.html?user_id=${user_id}`;
            alert("found");
        } else {
            alert("Error: user ID not found.");
            window.location.href = play.html;
        }
        heartsLeft--;
        updateHeart(heartsLeft);
        document.getElementById('heartStatus').innerText = `Hearts Left: ${heartsLeft}`;
    }

    const userInfo = await fetchUserInfo();

    if (userInfo && userInfo.next) {
        const next = userInfo.next; // e.g., "08:00:00"
        const nextDateTimeString = `${next}`; // "HH:MM:SS"
        const nextTime = new Date(nextDateTimeString).getTime();

        alert(nextTime);
        if (isNaN(nextTime)) {
            alert("Invalid `next` time format:", userInfo.next);
            return;
        }

        alert(formatToHHMMSS(nextTime));
        // Get the current time

        
        // Now you can make your comparison
        if (getCurrentTimeHHMMSS() >= formatToHHMMSS(nextTime)) {
            resetHearts(); 
            sendNextToDatabase();
            alert("Done :D")
        } else {
            alert("wait timer to finish")
        }
    }
}

function getCurrentTimeHHMMSS() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    const formattedHours = hours.toString().padStart(2, '0');
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = seconds.toString().padStart(2, '0');

    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
}

function formatToHHMMSS(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
        alert("User ID is missing.");
        return;
    } else {
        alert("User ID found :D");
    }
    try {
        const response = await fetch(`http://127.0.0.1:5000/get_user_info/${user_id}`);
        if (response.ok) {
            const data = await response.json();
            if (data.status === 'success') {

                const totalSeconds = data.data.timer;
                const next = data.data.next;

                const timerFormatted = formatToHHMMSS(totalSeconds);

                document.getElementById('heartStatus').innerText = "Hearts Left: " + data.data.heart;
                document.getElementById('totalScore').innerText = "Total score: " + data.data.score;
                document.getElementById('timer').innerText = `Timer: ${timerFormatted}`;

                alert("Done");
                return data.data;

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
    
    const timerFormatted = formatToHHMMSS(timerInSeconds)

    fetch('http://127.0.0.1:5000/update_timer', {
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
        alert('timer updated successfully: ' + JSON.stringify(data));
    })
    .catch(error => {
        alert('Error update timer: ' + error.message);
    });
}

function sendNextToDatabase() {

    const now = new Date();

    // Add 1 minute to the current time
    const futureTime = new Date(now.getTime() + 1 * 60 * 1000);  // 1 minute = 60 seconds * 1000 ms

    // Format as HH:MM:SS
    const hours = futureTime.getHours().toString().padStart(2, '0');
    const minutes = futureTime.getMinutes().toString().padStart(2, '0');
    const seconds = futureTime.getSeconds().toString().padStart(2, '0');

    const timerFormatted = `${hours}:${minutes}:${seconds}`;
    alert(timerFormatted);

    fetch('http://127.0.0.1:5000/update_next', {
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
    fetch('http://127.0.0.1:5000/update_heart', {
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

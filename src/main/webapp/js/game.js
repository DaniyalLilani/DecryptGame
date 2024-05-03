let player;
let ws;
let usernameSet = false;

// Function to set the room code and name from local storage
function setRoomCodeFromLocalStorage() {
    var storedName = localStorage.getItem("room-name");
    var storedCode = localStorage.getItem("room-code");

    var roomElement = document.getElementById("room");

    roomElement.textContent = "Room-" + storedName + " (" + storedCode + ")";

}
// function setCipher()
// {
//     var storedCipher = localStorage.getItem("room-cipher");
//     var cipherElement = document.getElementById("cipherText");
//
//     cipherElement.textContent = storedCipher;
// }
function getWord()
{
    return localStorage.getItem("room-word");

}

// Function to establish WebSocket connection
function connectWebSocket() {
    let roomCode = localStorage.getItem("room-code");
    ws = new WebSocket("ws://localhost:8080/WSChatServer-1.0-SNAPSHOT/ws/" + roomCode);
    // Event handler for WebSocket messages
    ws.onmessage = function(event) {
        console.log(event.data);
        let message = JSON.parse(event.data);

        if (message.type === "start-round") { // if not revert to start-round
            document.getElementById("startRound").style.display = "none";
            clearInterval(gameTimer); //Aryan: stop timer
            document.getElementById('timer').textContent = "01:00"; //Aryan: reset
            document.getElementById("cipherText").textContent = message.newCipher;
            console.log(message.newCipher + "<-- connectwebsocket");
            startGameTimer(59);  // Restart the game timer
            console.log("Round started with new cipher.");
        }
        else if (message.type === "get-session") {
            processGetSession(message);
        }
        else if(message.type==="score")
        {
            document.getElementById("scores").textContent = message.message;

        }
        else if(message.type === "endgame")
        {
            setTimeout(loadGameEndPage, 3000);
        }
            sendMessagePretty(message);

    };


    // Event handler for WebSocket errors
    ws.onerror = function(event) {
        console.error("WebSocket error observed:", event);
    };
}

// Function to set up message sending functionality
function setupMessageSending() {
    // Event listener for Enter key press
    document.getElementById("playerSolution").addEventListener("keyup", function(event) {
        if (event.key === "Enter" && usernameSet) {
            sendMessage(usernameSet); // Call sendMessage() function when Enter key is pressed
        }
        else if (event.key === "Enter")
        {
            sendMessage(usernameSet);
            setPlayerName();
            usernameSet = true;
        }
    });

    // Event listener for Send button click
    document.getElementById("submitSolution").addEventListener("click", function() {
        sendMessage(); // Call sendMessage() function when Send button is clicked
    });
}


function startRound() {
    let message = { type: "request-start-round" };
    ws.send(JSON.stringify(message));
}
// document.getElementById("startRound").addEventListener("click", startRound);


function setPlayerName() {
    fetch('http://localhost:8080/WSChatServer-1.0-SNAPSHOT/usernames')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok: ' + response.statusText);
            }
            return response.json(); // Ensure the response is parsed as JSON.
        })
        .then(usernames => {
            const keys = Object.keys(usernames);
            if (keys.length === 0) {
                console.error('No usernames found');
                // Handle scenario when no usernames are found
                return;
            }
            const lastUsername = usernames[keys[keys.length - 1]];
            updateUserNameStorage(lastUsername);
        })
        .catch(error => {
            console.error('Error fetching usernames:', error);
        });
}

function updateUserNameStorage(username) {
    const playerNameKey = localStorage.getItem("player1") ? "player2" : "player1";
    localStorage.setItem(playerNameKey, username);
    player = `${playerNameKey}_session`;
    getSession(); // Refresh session info based on new username
    console.log(`Set player to ${username}`);
    console.log(`playernamekey ${playerNameKey} and username ${localStorage.getItem(playerNameKey)}`);
}

function extractNameFromMessage(message) {
    // Split the message by space and retrieve the second part
    var parts = message.split(/\s+/);
    if (parts.length > 1) {
        return parts[1];
    } else {
        // Return the whole message if there's no space (no name)
        return message;
    }
}

// Function to send a chat message
// Function to send a chat message or set the username


function sendMessage(dir_message) { //Aryan: should change this parameter and usage
    var messageInput = document.getElementById("playerSolution");
    var message = messageInput.value.trim() || dir_message;

    // Check if the username has already been set
    if (!usernameSet) {
        // If the username hasn't been set, send a "set-username" message to the server
        var setUsernameRequest = {
            type: "set-username",
            username: message  // Assuming the user's chosen name is in the message
        };
        console.log("Setting username via WebSocket:", JSON.stringify(setUsernameRequest));
        usernameSet = true;

        ws.send(JSON.stringify(setUsernameRequest));
    } else if (message !== "") {// If the username has been set, send a normal chat message
        var chatMessageRequest = {
            type: "chat",
            msg: message  // The actual chat message content
        };
        console.log("Sending chat message via WebSocket:", JSON.stringify(chatMessageRequest.msg));
        ws.send(JSON.stringify(chatMessageRequest));
    }

    // Clear the message input field after sending the message
    messageInput.value = "";
}

/*
ws.onmessage = function(event) {
    console.log("Message received:", event.data);
    let message = JSON.parse(event.data);

    if (message.type === "chat") {
        displayMessage(message);
    } else if (message.type === "start-round") {
        document.getElementById("cipherText").textContent = message.newCipher;
        startGameTimer(59);
        console.log("Round started with new cipher.");
    } else if (message.type === "get-session") {
        processGetSession(message);
    } else {
        console.error("Unhandled message type received:", message.type);
    }
};*/

function displayMessage(message) {
    var chatDisplay = document.getElementById('messages');
    var messageDiv = document.createElement('div');
    messageDiv.textContent = "[" + timestamp() + "] " + message.msg;
    messageDiv.classList.add("messageStyle");
    chatDisplay.appendChild(messageDiv);
    chatDisplay.scrollTop = chatDisplay.scrollHeight;
}

function getPlayerAssignment()
{
    var request = {
        "type": "update-names",
        "player1": localStorage.getItem("player1"),
        "player2": localStorage.getItem("player2")
    };
    ws.send(JSON.stringify(request));
    console.log("Player names sent: " + JSON.stringify(request));
}

function getSession()
{
    var session_request = {
        "type": "get-session"
    };
    ws.send(JSON.stringify(session_request));
    console.log("session request sent: " + JSON.stringify(session_request));
}

function processGetSession(message)
{
    var stored_session = localStorage.getItem(player);

    if(stored_session == null)
    {
        console.log("setting player: " +player+ " to session "+message.message);
        localStorage.setItem(player,message.message);
    }
    else if (message.message === stored_session)
    {
        // Split the string by underscore
        var parts = player.split('_');

// Extract player 2 from the parts
        var player_ext = parts[0];

        updateScore(player_ext);
    }
}

function loadGameEndPage() {
    // Change the URL to the new page
    window.location.href = "gameOver.html"; // Replace "new_page.html" with the URL of the page you want to navigate to
}

// Call the loadNewPage function after 5 seconds
// 5000 milliseconds = 5 seconds


// Function to generate a timestamp
function timestamp() {
    let d = new Date();
    return d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');
}

// Function to display messages neatly
function sendMessagePretty(message) {
    if (!message || typeof message.type === 'undefined') {
        console.error('Message is undefined or does not have a type.');
        return;
    }
    var chatDisplay = document.getElementById('messages');
    if (message.type === "get-session") {
        console.log("received session");
    }
    else if(message.type ==="chat"){
        var messageDiv = document.createElement('div');
        messageDiv.textContent = "[" + timestamp() + "] " + message.message;
        messageDiv.classList.add("messageStyle"); // Ensure this class exists in your CSS
        chatDisplay.appendChild(messageDiv);
    }
    chatDisplay.scrollTop = chatDisplay.scrollHeight;
}

// function startGame() {
//     //startGameTimer(59); //Aryan: goes to 59 after the default 1m
//     setCipher();
// }

//---------------------------------------------------------------------------------------------------------------

// Game-specific logic
let gameTimer;
let playerScores = { player1: 0, player2: 0 };

// Function to start the game timer
function startGameTimer(duration) {
    let timer = duration, minutes, seconds;
    gameTimer = setInterval(function () {
        minutes = parseInt(timer / 60, 10);
        seconds = parseInt(timer % 60, 10);

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        document.getElementById('timer').textContent = minutes + ":" + seconds;

        if (--timer < -1) { //Aryan: If the next iteration passes 0, then done
            clearInterval(gameTimer); //Aryan: stop timer
            document.getElementById('timer').textContent = "01:00"; //Aryan: reset
            sendMessage(true, "Time's up!"); //Aryan: tell players its done
            startRound(); //Aryan: start new round
        }
    }, 1000);
}

function updateScore(player) {
    if (player === 'player1' || player === 'player2') {
        sendMessage(true, player + " has won the round!");
        clearInterval(gameTimer); // Stop timer
        document.getElementById('timer').textContent = "01:00"; // Reset time
        playerScores[player] += 1;
        document.getElementById('scores').textContent = `Player 1: ${playerScores.player1} | Player 2: ${playerScores.player2}`;

        if (playerScores[player] >= 5) {
            // End game sequence
            endGame(player);
        } else {
            // Request new cipher for next round
            requestNewCipher();
            console.log(localStorage.getItem("room-cipher"));
            console.log(localStorage.getItem("room-word"));
            console.log("See new cipher above");
        }
    }
}

function requestNewCipher() {
    console.log("Fetching new cipher in game.js");
    fetch('http://localhost:8080/WSChatServer-1.0-SNAPSHOT/cipher')
        .then(response => response.text())
        .then(cipher_word_resp => {
            console.log("New cipher and word received: " + cipher_word_resp);
            let [newCipher, newWord] = cipher_word_resp.split(" ");
            localStorage.setItem("room-cipher", newCipher);
            localStorage.setItem("room-word", newWord);

            // Update the UI
            document.getElementById("cipherText").textContent = newCipher;
            broadcastSystemMessage("CONSOLE: A new round has begun with a fresh cipher!"); // Broadcast new round start
        })
        .catch(error => {
            console.error('Error fetching the new cipher:', error);
            alert("Failed to fetch new cipher. Check console for more details.");
        });
}

function broadcastSystemMessage(message) {
    var request = { "type": "chat", "msg": message };
    ws.send(JSON.stringify(request));
}


function endGame(player) {
    clearInterval(gameTimer);
    console.log(player + " has won the game!");
    sendMessage(true, "Game over, " + player + "Has won the game!");
    alert(player + ' wins!');
    setTimeout(loadGameEndPage, 5000);
}

// Execute these functions when the window loads
window.onload = function() {
    console.log("onload");
    setRoomCodeFromLocalStorage();
    connectWebSocket();
    setupMessageSending();
    //localStorage.clear();
};
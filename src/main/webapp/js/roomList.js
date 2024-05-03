// Function to load chat rooms from local storage
function loadChatRooms() {
    const rooms = JSON.parse(localStorage.getItem('chatRooms'));
    if (rooms) {
        rooms.forEach(roomName => appendRoomToTable(roomName));
    }
}

// Function to create a new room
function newRoom(button) {
    // Extract the room name from the table row
    var name = button.closest('tr').querySelector('td:first-child').textContent.trim();
    // Check if room code is already stored in local storage
    var code = localStorage.getItem(name+"code");
    var cipher = localStorage.getItem(name+"cipher")
    var word = localStorage.getItem(name+"word");

    if (code != null ){//&& cipher!= null) {

        console.log("room code : "+localStorage.getItem(name+"code"));
        console.log("cipher : "+localStorage.getItem(name+"cipher"));
        // If room code exists, enter the room
        enterNewRoom(button, code, cipher, word);
    }

    else {
        // Otherwise, fetch a new room code from the server
        let callURL = "http://localhost:8080/WSChatServer-1.0-SNAPSHOT/chat-servlet";
        fetch(callURL, {
            method: 'GET',
            headers: {
                'Accept': 'text/plain',
            },
        })
            .then(response => response.text())
            .then(response => {
                console.log("code : " + response);
                localStorage.setItem(name+"code", response);
                code = response;
            });
            console.log("fetching cipher");
            fetch('http://localhost:8080/WSChatServer-1.0-SNAPSHOT/cipher')
                .then(cipher_word_resp => cipher_word_resp.text())
                .then(cipher_word_resp => {
                    console.log("cipher : " + cipher_word_resp);
                    let [cipher_resp, split_word] = cipher_word_resp.split(" ");
                    console.log(cipher_resp);
                    console.log(split_word);
                    localStorage.setItem(name+"cipher", cipher_resp);
                    localStorage.setItem(name+"word", split_word);
                    cipher = cipher_resp;
                    word = split_word;

                })
                .then(cipher_word_resp => {
                    enterNewRoom(button, code, cipher, word);
                })

                .catch(error => console.error('Error fetching the cipher:', error));
        }
}

// Function to enter a new room
function enterNewRoom(button, code, cipher, word) {
    // Store room code and name in local storage
    //console.log("setting room-code to "+code);
    //console.log("setting room-cipher to "+cipher);
    localStorage.setItem("room-code", code);
    localStorage.setItem("room-cipher", cipher);
    localStorage.setItem("room-word", word);

    var name = button.closest('tr').querySelector('td:first-child').textContent.trim();
    localStorage.setItem("room-name", name);
    console.log("User Name:", name);

     //Navigate to the game.html page
    window.location.href = "game.html";
}

// Function to show the input field for creating a new room
function showCreateRoomInput() {
    var inputField = document.getElementById('roomNameInput');
    var confirmButton = document.getElementById('confirmCreateRoom');
    inputField.style.display = 'block'; // Show the input field
    confirmButton.style.display = 'block'; // Show the confirm button
    inputField.focus(); // Automatically focus the input field
}

// Function to create a new room
function createRoom() {
    const inputField = document.getElementById('roomNameInput');
    const roomName = inputField.value.trim();

    if (roomName) {
        const callURL = "http://localhost:8080/WSChatServer-1.0-SNAPSHOT/chat-servlet";
        // Include additional data if needed, for example, a room name
        const postData = { roomName: roomName };

        inputField.style.display = 'none';
        inputField.value = '';
        document.getElementById('confirmCreateRoom').style.display = 'none'; // Hide the confirm button

        appendRoomToTable(roomName);
        newRoom();

    } else {
        alert("Please enter a room name.");
    }
}

// Function to append a new room to the table
function appendRoomToTable(roomName) {
    const table = document.getElementById('chatRoomsTable');
    const newRow = table.insertRow();
    const cell1 = newRow.insertCell(0);
    const cell2 = newRow.insertCell(1);
    const cell3 = newRow.insertCell(2);

    cell1.textContent = roomName;

    const joinButton = document.createElement('button');
    joinButton.textContent = 'Join';
    joinButton.onclick = function() { newRoom(this); };
    cell2.appendChild(joinButton);

    const removeButton = document.createElement('button');
    removeButton.textContent = 'Remove';
    removeButton.classList.add('remove-button');
    removeButton.onclick = function() { removeRoom(roomName); };
    cell3.appendChild(removeButton);

    // Store the updated list of chat rooms
    storeChatRooms();
}

// Function to store the list of chat rooms in local storage
function storeChatRooms() {
    const roomElements = document.querySelectorAll('#chatRoomsTable tr td:first-child');
    const rooms = Array.from(roomElements).map(cell => cell.textContent);
    localStorage.setItem('chatRooms', JSON.stringify(rooms));
}

// Optional: Trigger createRoom function when Enter is pressed
function handleKeyPress(event) {
    if (event.key === 'Enter') {
        createRoom();
    }
}

// Function to remove a room from the table
function removeRoom(roomName) {
    // Find the table
    var table = document.getElementById('chatRoomsTable');
    // Iterate over the rows and find the row with the matching room name
    for (var i = 1, row; row = table.rows[i]; i++) { // Start from i = 1 to skip header row
        if (row.cells[0].textContent === roomName) {
            table.deleteRow(i);
            break; // Stop the loop once the room is found and removed
        }
    }
    // Update the stored chat rooms after removal
    storeChatRooms();
    localStorage.removeItem(roomName+"code");
    localStorage.removeItem(roomName+"cipher");
    localStorage.removeItem(roomName+"word");
    localStorage.removeItem("player1");
    localStorage.removeItem("player2");
    localStorage.removeItem("player1_session");
    localStorage.removeItem("player2_session");

    //localStorage.clear();
}

// Function to refresh the chat rooms list
function refreshList() {
    deleteTable();
    loadChatRooms();
}
function deleteTable()
{
    const table = document.getElementById('chatRoomsTable');
    let rowCount = table.rows.length;
    while (--rowCount) {
        table.deleteRow(rowCount);
    }
}

window.onload = function() {
    console.log("running");
    deleteTable();
    loadChatRooms();

};



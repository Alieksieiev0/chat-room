let socket: WebSocket;
let username: string;
let pendingIntervalId: number;

async function saveUsername() {
    const usernameContainer = <HTMLDivElement>document.getElementById("username-container")
    const roomContainer = <HTMLDivElement>document.getElementById("room-container")
    const input = <HTMLInputElement>(document.getElementById("username-input"));
    username = input.value;
    console.log(username);

    if (usernameContainer == null || roomContainer === null) {
        return
    }

    usernameContainer.style.display = "none"
    roomContainer.style.display = "block"

    await processRoomsRequest("GET");
    pendingIntervalId = setInterval(function() { processRoomsRequest("GET") }, 1000);
}

async function createRoom() {
    await processRoomsRequest("POST");
}

function join(e: MouseEvent) {
    const button = <HTMLButtonElement>e.target
    let id = button.id.split('-').pop()

    if (id === undefined) {
        return
    }

    createWebsocket(id)
    if (pendingIntervalId) {
        clearInterval(pendingIntervalId)
    }
}

function createWebsocket(id: string) {
    socket = new WebSocket("ws://localhost:3000/rooms/" + id)

    socket.onopen = () => {
        const roomContainer = <HTMLDivElement>document.getElementById("room-container")
        const chatContainer = <HTMLDivElement>document.getElementById("chat-container")

        if (roomContainer === null || chatContainer === null) {
            return
        }
        roomContainer.style.display = "none"
        chatContainer.style.display = "block"
    }

    socket.onmessage = (e) => {
        const messagesContainer = <HTMLDivElement>document.getElementById("messages-container")
        if (!e || !e.data) {
            return
        }
        let data = JSON.parse(e.data)
        const node = <HTMLDivElement>document.createElement("div")
        node.innerHTML = data.username + ": " + data.value

        messagesContainer.appendChild(node);
    }

    socket.onclose = () => {
        const roomContainer = <HTMLDivElement>document.getElementById("room-container")
        const chatContainer = <HTMLDivElement>document.getElementById("chat-container")

        if (roomContainer === null || chatContainer === null) {
            return
        }
        roomContainer.style.display = "block"
        chatContainer.style.display = "none"
    }
}



function sendMessage() {
    const chatInput = <HTMLInputElement>document.getElementById("chat-input")
    if (!chatInput || !chatInput.value) {
        return
    }

    if (socket == null) {
        return
    }

    socket.send(JSON.stringify({ value: chatInput.value, username: username }))
    chatInput.value = ""
}

async function leaveRoom() {
    socket.close(1000)
    await processRoomsRequest("GET");
    pendingIntervalId = setInterval(function() { processRoomsRequest("GET") }, 5000);
}

async function processRoomsRequest(method: string) {
    const htmlRooms = document.getElementById("rooms")
    console.log(htmlRooms);
    if (htmlRooms === null) {
        return
    }

    const rooms = await sendRequest(method, "/rooms");
    const roomElements = []

    console.log(rooms);
    rooms.sort(function(a: any, b: any) {
        return a.id - b.id;
    });

    for (let room of rooms) {
        console.log(room);
        let roomElement = <HTMLDivElement>(document.createElement('div'))
        roomElement.id = "room-" + room.id
        roomElement.innerHTML = "Room #" + room.id

        let roomButton = <HTMLButtonElement>(document.createElement('button'))
        roomButton.id = "room-button-" + room.id
        roomButton.innerHTML = "Join"
        roomButton.onclick = join

        roomElement.appendChild(roomButton)
        roomElements.push(roomElement)
    }

    console.log(htmlRooms);

    htmlRooms.replaceChildren(...roomElements)
    console.log(htmlRooms);
}

function sendRequest(method: string, endpoint: string): Promise<any> {
    return new Promise(function(resolve, reject) {
        const xhr = new XMLHttpRequest()
        xhr.open(method, endpoint, true)

        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                console.log(xhr.response);
                console.log(xhr.responseText);
                resolve(JSON.parse(xhr.response))
                return
            }
            reject({
                status: xhr.status,
                statusText: xhr.statusText
            })
        }

        xhr.send(null)
    });
}

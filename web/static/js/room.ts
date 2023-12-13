/*
enum MessageType {
    Username = "Username",
    Chat = "Chat",
}

class Message {
    type: MessageType
    value: string
    sender: string

    constructor(type: MessageType, value: string, sender: string) {
        this.type = type
        this.value = value
        this.sender = sender
    }
}

class User {
    name: string | undefined
    socket: WebSocket

    constructor(socket: WebSocket) {
        this.socket = socket
    }

}

const usernameContainer = <HTMLInputElement>document.getElementById("username-container")
const usernameInput = <HTMLInputElement>document.getElementById("username-input")
const chatContainer = <HTMLInputElement>document.getElementById("chat-container")
const chatInput = <HTMLInputElement>document.getElementById("chat-input")
const messagesContainer = <HTMLInputElement>document.getElementById("messages-container")
const output = <HTMLInputElement>document.getElementById("output")
const user = new User(new WebSocket("ws://localhost:3000/chat-room"))


user.socket.onopen = function() {
    //output.innerHTML += "Status: Connected\n"
}

user.socket.onmessage = function(e) {
    if (!e || !e.data) {
        output.value = "Incorrect data"
        return
    }
    let data = JSON.parse(e.data)

    switch (data.type) {
        case MessageType.Username: {
            user.name = data.value
            usernameContainer.style.display = "none"
            chatContainer.style.display = "block"
            output.innerHTML = "Hello, " + user.name + "!"
            break
        }
        case MessageType.Chat: {
            const node = document.createElement("div")
            node.innerHTML = data.value
            messagesContainer.appendChild(node);
            break
        }
        default: {
            output.innerHTML = "Unexpected message"
        }
    }

}



function submitUsername() {
    console.log(usernameInput)
    if (!usernameInput || !usernameInput.value) {
        return
    }

    user.socket.send(JSON.stringify(new Message(MessageType.Username, usernameInput.value, "")))
    usernameInput.value = ""
}

function sendMessage() {
    if (!chatInput || !chatInput.value) {
        return
    }

    let name = "";
    if (user.name != undefined) {
        name = user.name;
    }

    user.socket.send(JSON.stringify(new Message(MessageType.Chat, chatInput.value, name)))
    chatInput.value = ""
}
*/

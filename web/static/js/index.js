"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
let socket;
let username;
let pendingIntervalId;
function saveUsername() {
    return __awaiter(this, void 0, void 0, function* () {
        const usernameContainer = document.getElementById("username-container");
        const roomContainer = document.getElementById("room-container");
        const input = (document.getElementById("username-input"));
        username = input.value;
        console.log(username);
        if (usernameContainer == null || roomContainer === null) {
            return;
        }
        usernameContainer.style.display = "none";
        roomContainer.style.display = "block";
        yield processRoomsRequest("GET");
        pendingIntervalId = setInterval(function () { processRoomsRequest("GET"); }, 100);
    });
}
function processRoomsRequest(method) {
    return __awaiter(this, void 0, void 0, function* () {
        const htmlRooms = document.getElementById("rooms");
        console.log(htmlRooms);
        if (htmlRooms === null) {
            return;
        }
        const rooms = yield sendRequest(method, "/rooms");
        const roomElements = [];
        console.log(rooms);
        rooms.sort(function (a, b) {
            return a.id - b.id;
        });
        for (let room of rooms) {
            console.log(room);
            let roomElement = (document.createElement('div'));
            roomElement.id = "room-" + room.id;
            roomElement.innerHTML = "Room #" + room.id;
            let roomButton = (document.createElement('button'));
            roomButton.id = "room-button-" + room.id;
            roomButton.innerHTML = "Join";
            roomButton.onclick = join;
            roomElement.appendChild(roomButton);
            roomElements.push(roomElement);
        }
        console.log(htmlRooms);
        htmlRooms.replaceChildren(...roomElements);
        console.log(htmlRooms);
    });
}
function sendRequest(method, endpoint) {
    return new Promise(function (resolve, reject) {
        const xhr = new XMLHttpRequest();
        xhr.open(method, endpoint, true);
        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                console.log(xhr.response);
                console.log(xhr.responseText);
                resolve(JSON.parse(xhr.response));
                return;
            }
            reject({
                status: xhr.status,
                statusText: xhr.statusText
            });
        };
        xhr.send(null);
    });
}
function createRoom() {
    return __awaiter(this, void 0, void 0, function* () {
        yield processRoomsRequest("POST");
    });
}
function join(e) {
    const button = e.target;
    let id = button.id.split('-').pop();
    if (id === undefined) {
        return;
    }
    createWebsocket(id);
    if (pendingIntervalId) {
        clearInterval(pendingIntervalId);
    }
}
function createWebsocket(id) {
    socket = new WebSocket("ws://localhost:3000/rooms/" + id);
    socket.onopen = () => {
        const roomContainer = document.getElementById("room-container");
        const chatContainer = document.getElementById("chat-container");
        if (roomContainer === null || chatContainer === null) {
            return;
        }
        roomContainer.style.display = "none";
        chatContainer.style.display = "block";
    };
    socket.onmessage = (e) => {
        const messagesContainer = document.getElementById("messages-container");
        if (!e || !e.data) {
            return;
        }
        let data = JSON.parse(e.data);
        const node = document.createElement("div");
        node.innerHTML = data.username + ": " + data.value;
        messagesContainer.appendChild(node);
    };
    socket.onclose = () => {
        const roomContainer = document.getElementById("room-container");
        const chatContainer = document.getElementById("chat-container");
        if (roomContainer === null || chatContainer === null) {
            return;
        }
        roomContainer.style.display = "block";
        chatContainer.style.display = "none";
    };
}
function sendMessage() {
    const chatInput = document.getElementById("chat-input");
    if (!chatInput || !chatInput.value) {
        return;
    }
    if (socket == null) {
        return;
    }
    socket.send(JSON.stringify({ value: chatInput.value, username: username }));
    chatInput.value = "";
}
function leaveRoom() {
    return __awaiter(this, void 0, void 0, function* () {
        socket.close(1000);
        yield processRoomsRequest("GET");
        pendingIntervalId = setInterval(function () { processRoomsRequest("GET"); }, 5000);
    });
}

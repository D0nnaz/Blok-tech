/* global io */ 
const inputField = document.querySelector(".input-field");
const sendButton = document.querySelector(".send-button");
const chatBox = document.querySelector(".chat-box");
const socket = io();
const fallbackMessage = document.querySelector(".fallback-message");
let username;

document.getElementById("input-form").addEventListener("submit", function (e) {
  e.preventDefault();
});

if (fallbackMessage.style.display !== "none") {
  fallbackMessage.style.display = "none";
}

socket.on("connect", function () {
  console.log("Connected to server");
});

socket.on("message", function (data) {
  displayMessage(data);
  setTimeout(scrollToBottom, 100);
});

socket.on("chatHistory", function (chatHistory) {
  chatHistory.forEach((message) => {
    displayMessage(message);
  });
  setTimeout(scrollToBottom, 100);
});

socket.on("loggedInUser", function (loggedInUser) {
  username = loggedInUser;
});

sendButton.addEventListener("click", sendMessage);

inputField.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    sendMessage();
  }
});

function sendMessage() {
  const messageContent = inputField.value;

  if (!messageContent.trim()) {
    return;
  }
  inputField.value = "";

  socket.emit("message", { content: messageContent });
}

function displayMessage(message, isSocketMessage = true) {
  if (isSocketMessage && message.content.trim() === "") {
    return;
  }

  const newChatBubble = document.createElement("div");
  newChatBubble.classList.add("chat-bubble");
  newChatBubble.classList.add(getMessageClass(message.sender));

  const usernameElement = document.createElement("p");
  usernameElement.classList.add(addUsername(message.sender));
  usernameElement.textContent = `${message.sender} - ${getFormattedTimestamp(
    message.timestamp
  )}`;
  chatBox.appendChild(usernameElement);

  newChatBubble.textContent = message.content;
  chatBox.appendChild(newChatBubble);
}

function getMessageClass(sender) {
  if (sender === username) {
    return "right-bubble";
  } else {
    return "left-bubble";
  }
}

function addUsername(sender) {
  if (sender === username) {
    return "username-me";
  } else {
    return "username";
  }
}

function getFormattedTimestamp(timestamp) {
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

function scrollToBottom() {
  const lastChatBubble = chatBox.lastElementChild;
  if (lastChatBubble) {
    lastChatBubble.scrollIntoView({ behavior: "smooth" });
  }
}

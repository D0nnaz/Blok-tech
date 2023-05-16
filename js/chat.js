const inputField = document.querySelector(".input-field");
const sendButton = document.querySelector(".send-button");
const chatBox = document.querySelector(".chat-box");
const socket = io();

socket.on("connect", function () {
  console.log("Connected to server");
});

socket.on("message", function (data) {
  displayMessage(data);
});

socket.on("chatHistory", function (chatHistory) {
  chatHistory.forEach((message) => {
    displayMessage(message);
  });
});

sendButton.addEventListener("click", sendMessage);

inputField.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    sendMessage();
  }
});

function sendMessage() {
  const messageContent = inputField.value;
  inputField.value = "";

  socket.emit("message", { content: messageContent, sender: socket.id });
}

function displayMessage(message) {
  const newChatBubble = document.createElement("div");
  newChatBubble.classList.add("chat-bubble");
  newChatBubble.classList.add(getMessageClass(message.sender));

  newChatBubble.textContent = message.content;
  chatBox.appendChild(newChatBubble);
}

function getMessageClass(sender) {
  if (sender === socket.id) {
    return "right-bubble";
  } else {
    return "left-bubble";
  }
}
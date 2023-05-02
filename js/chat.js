//chat.js
const backButton = document.querySelector('.back-arrow');
const inputField = document.querySelector('.input-field');
const sendButton = document.querySelector('.send-button');
const chatBox = document.querySelector('.chat-box');
const messageInput = document.getElementById('message-input');

const socket = io();

socket.on('connect', function() {
  console.log('Connected to server');
});

socket.on('message', function(data) {
  const newChatBubble = document.createElement('div');
  newChatBubble.classList.add('chat-bubble');
  newChatBubble.classList.add(getMessageClass(data.sender));

  newChatBubble.textContent = data.content;
  chatBox.appendChild(newChatBubble);
});

inputField.addEventListener('keypress', function(e) {
  if (e.key === 'Enter') {
    sendMessage();
  }
});

function sendMessage() {
  const messageContent = inputField.value;
  inputField.value = '';

  socket.emit('message', { content: messageContent, sender: socket.id });
}

function getMessageClass(sender) {
  console.log(socket.id);
  if (sender === socket.id) {
    return 'right-bubble';
  } else {
    return 'left-bubble';
  }
}

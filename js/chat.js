console.log("test chat.js")
const backButton = document.querySelector('.back-arrow');
const inputField = document.querySelector('.input-field');
const sendButton = document.querySelector('.send-button');
const chatBox = document.querySelector('.chat-box');
const messageInput = document.getElementById('message-input');
const emojiButton = document.querySelector('.emoji');

const socket = io();

socket.on('connect', function() {
  console.log('Connected to server');
});

socket.on('message', function(data) {
  const newChatBubble = document.createElement('div');
  newChatBubble.classList.add('chat-bubble', 'left-bubble');
  newChatBubble.textContent = data;

  chatBox.appendChild(newChatBubble);
});

emojiButton.addEventListener('click', () => {
  inputField.focus();
  inputField.setAttribute('type', 'text');
  inputField.setAttribute('type', 'emoji');
});

inputField.addEventListener('keypress', function(e) {
  if (e.key === 'Enter') {
    sendMessage();
  }
});

sendButton.addEventListener('click', function() {
  sendMessage();
});

function sendMessage() {
  const messageContent = inputField.value;

  const newChatBubble = document.createElement('div');
  newChatBubble.classList.add('chat-bubble', 'right-bubble');
  newChatBubble.textContent = messageContent;

  chatBox.appendChild(newChatBubble);

  inputField.value = '';

  socket.emit('message', messageContent);
}

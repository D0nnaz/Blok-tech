console.log("hey");
const audio = document.getElementById("myAudio");
audio.onloadedmetadata = function() {
audio.play();
};
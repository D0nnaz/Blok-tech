const clickme = document.getElementById('click-me');
const audio = document.getElementById('hello-audio');

clickme.addEventListener('click', () => {
  audio.play();
});
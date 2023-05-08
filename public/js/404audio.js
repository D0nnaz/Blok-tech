window.onload = function() {
    const audio = document.getElementById('hello-audio');
    audio.onloadedmetadata = function() {
      audio.play();
    };
  };
  

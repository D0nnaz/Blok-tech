window.onload = function() {
    const audio = document.getElementById("hello-audio");
    audio.onloadedmetadata = function() {
      audio.play();
    };
  };
  

  Bij beiden zie je je eigen berichten rechts en de berichten van de anders links.
const express = require('express');
const app = express();

app.get('/', function(req, res) {
  res.send('Welkom op de homepage!');
});


app.get('/chat', function(req, res) {
  res.send('Dit is een chat');
});

app.use(function(req, res, next) {
  res.status(404).send('404 Not Found :(');
});

app.use(express.static('static'));

app.listen(3000, function() {
  console.log('Server started on port 3000');
});

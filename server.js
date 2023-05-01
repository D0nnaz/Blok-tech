// server.js

const express = require('express');
const app = express();
const { engine } = require('express-handlebars');
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const PORT = process.env.PORT || 3000;



app.use('/static', express.static('static'));
app.use('/js', express.static('js'));

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');

app.get('/', function(req, res) {
  res.render('home', { title: 'Homepage' });
});

app.get('/chat', function(req, res) {
  res.render('chat', { title: 'Chatpage' });
});

app.use(function(req, res, next) {
  res.status(404).render('404', { title: '404 Not Found :(' });
});

io.on('connection', (socket) => {
  console.log('A user connected');
  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });
});

http.listen(PORT, () => { 
  console.log(`Server running on port: ${PORT}`)
});

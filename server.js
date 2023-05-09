/* eslint-disable quotes */
//server.js
const express = require('express');
const app = express();
const { engine } = require('express-handlebars');
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const PORT = process.env.PORT || 3000;
const os = require('os'); //NIET MIJN CODE GAAT LATER WEG

const interfaces = os.networkInterfaces();//NIET MIJN CODE
const addresses = [];//NIET MIJN CODE

Object.keys(interfaces).forEach((interfaceName) => {//NIET MIJN CODE
  interfaces[interfaceName].forEach((interfaceInfo) => {//NIET MIJN CODE
    if (interfaceInfo.family === 'IPv4' && !interfaceInfo.internal) {//NIET MIJN CODE
      addresses.push(interfaceInfo.address);//NIET MIJN CODE
    }//NIET MIJN CODE
  });//NIET MIJN CODE
});

console.log(`Server IP address: ${addresses[0]}`); //NIET MIJN CODE EINDE

app.use('/static', express.static('static'));
app.use('/js', express.static('js'));

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');

app.get('/', function(req, res) {
  res.render('home', { title: 'Homepage' });
});

app.get('/login', function(req, res) {
  res.render('login', { title: 'login' });
});

app.get('/chat', function(req, res) {
  res.render('chat', {
    layout: false,
    messages: [],
    currentUser: req.query.user
  });
});

app.use(function(req, res) {
  res.status(404).render('404', { title: '404 Not Found :(' });
});

const messages = [];

io.on('connection', (socket) => {
  console.log('A user connected');

  messages.forEach(message => {
    socket.emit('message', message);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });

  socket.on('message', (msg) => {
    msg.sender = socket.id;
    messages.push(msg);
    io.emit('message', msg);
  });
});

http.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port: ${PORT}`);
});

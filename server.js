const express = require('express');
const { engine } = require('express-handlebars');
const PORT = process.env.PORT || 3000;

const app = express();

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

app.listen(PORT, () => { 
  console.log(`Server running on port: ${PORT}`)
});

const express = require('express');
const { engine } = require('express-handlebars');
const PORT = process.env.port || 1337;

const app = express();

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', 'view');


app.get('/', (req, res) => {
  res.render('home');
})

app.listen(PORT, () => {
  console.log(`Server running on port: ${port}`)
});
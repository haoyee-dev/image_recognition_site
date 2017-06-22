const express = require('express');
const app = express();

app.get('/', function (req, res) {
  res.sendFile(__dirname + "/index.html");
})

app.get('/jquery-3.2.1.min.js', function (req, res) {
  res.sendFile(__dirname + "/jquery-3.2.1.min.js");
})

app.get('/main.js', function (req, res) {
  res.sendFile(__dirname + "/main.js");
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})
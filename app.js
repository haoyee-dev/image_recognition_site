const express = require('express');
const app = express();

app.get('/', function (req, res) {
  res.sendFile(__dirname + "/index.html");
})

app.get('/style.css', function (req, res) {
  res.sendFile(__dirname + "/style.css");
})

app.get('/loading.gif', function (req, res) {
  res.sendFile(__dirname + "/loading.gif");
})

app.get('/jquery-3.2.1.min.js', function (req, res) {
  res.sendFile(__dirname + "/jquery-3.2.1.min.js");
})

app.get('/main.js', function (req, res) {
  res.sendFile(__dirname + "/main.js");
})

app.listen(8080, function () {
  console.log('Example app listening on port 8080')
})
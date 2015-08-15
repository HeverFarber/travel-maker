var express = require('express');
var app = express();

app.use(express.static('client'));
app.use("/node_modules", express.static('node_modules'));


var server = app.listen(9000, function () {
  console.log('listening at 3000');
});
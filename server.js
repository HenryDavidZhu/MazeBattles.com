var colyseus = require("colyseus");
var http = require("http");
var express = require("express");
var port = process.env.port || 3000;

var app = express();

app.use(express.static("public", { dotfiles: 'allow' }));

var gameServer = new colyseus.Server({
  server: http.createServer(app)
});


gameServer.listen(port);
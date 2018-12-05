var path = require('path');
var express = require('express');
var handlebars = require('handlebars');
var exphbs = require('express-handlebars');
var app = express();
var port = process.env.PORT || 3000;

var playerData = require('./data/players.json');
var gameData = require('./data/games.json');
var pokemonData = require('./data/pokemon-ranks.json');
var ruleData = require('./data/rules.json');

app.engine('handlebars', exphbs({ defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.get('/', function(req, res){
    res.status(200).render('home');
});

app.use(express.static(__dirname + '/public'));

app.listen(port, function(){
    console.log("== Server is listening on port", port, "==");
});
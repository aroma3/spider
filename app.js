// var MongoClient = require('mongodb').MongoClient;
// var assert = require('assert');
var express = require('express');
var myData = require('./readmongodb');
// var path = require('path');
// var views = require('./src/views');

var app = express();
var debug = require('debug')('hello');

app.get('/', function(req, res){
	res.sendfile('./src/views/index.html');
});

app.get('/getData', function(req, res){

	myData.getData(function(data){
			res.send( JSON.stringify(data) );
	});
	// res.send(200);
	
});

app.set('port', process.env.PORT || 3000);

var server = app.listen(app.get('port'), function() {
  debug('Express server listening on port ' + server.address().port);
});
module.exports = app;

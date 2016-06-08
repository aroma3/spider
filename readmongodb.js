var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');



var url = 'mongodb://localhost:27017/test';

var myData = [];
var findRestaurants = function(db, callback) {
   var cursor =db.collection('spider').find(  );
   cursor.each(function(err, doc) {
      assert.equal(err, null);
      if (doc != null) {
      	myData.push(doc);
         // console.dir(doc);
      } else {
         callback();
      }
   });
};

exports.getData = function(cb){
	console.log('==========in  getData==========');

	MongoClient.connect(url, function(err, db) {
		  assert.equal(null, err);
		  console.log('Connected correctly to server.');

		  findRestaurants(db, function() {
		  	  cb( myData );
		      db.close();
		  });
		});
}


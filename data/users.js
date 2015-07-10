var path = require('path');
var Datastore = require('nedb');
var db = {
  users: new Datastore({ filename: path.join(__dirname, 'users.db'), autoload: true })
};

var users = {
  create: function(name, userid, callback) {
    db.users.insert({name: name,userid:userid}, callback);
  },
  list: function(callback) {
    db.users.find({}, function(err, docs) {
		people = {};
		for (var i = 0; i < docs.length; i++) {
			people[docs[i].userid] = docs[i].name;
		}
		return callback(people);
  	});
  },
  remove: function(userid, callback) {
    db.users.remove({userid: userid}, callback);
  }
};

module.exports = users;
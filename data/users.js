var path = require('path');
var Datastore = require('nedb');
var db = {
  users: new Datastore({ filename: path.join(__dirname, 'users.db'), autoload: true })
};

var users = {
  create: function(name, callback) {
    db.users.insert({name: name }, callback);
  },
  list: function(callback) {
    db.users.find({}).exec(callback);
  },
  remove: function(name, callback) {
    db.users.remove({name: name }, callback);
  }
};

module.exports = users;
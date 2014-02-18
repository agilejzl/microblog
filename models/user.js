var md5 = require('MD5');
var mongodb = require('./db');

function User(user) {
  this.name = user.name;
  this.password = user.password;
  this.email = user.email;
  this.is_admin = user.is_admin;
};
module.exports = User;

User.prototype.save = function save(callback) {
  // 存入 Mongodb 的文档
  var user = {
    name: this.name,
    password: this.password,
    email: this.email,
    is_admin: this.is_admin
  };
  mongodb.open(function(err, db) {
    if (err) {
      return callback(err);
    }
    // 读取 users 集合
    db.collection('users', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      // 为 name 属性添加索引
      collection.ensureIndex('name', {unique: true}, {w: 0});
      // 写入 user 文档
      collection.insert(user, {safe: true}, function(err, user) {
        mongodb.close();
        callback(err, user);
      });
    });
  });
};

User.get = function get(username, callback) {
  mongodb.open(function(err, db) {
    if (err) {
      return callback(err);
    }
    // 读取 users 集合
    db.collection('users', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      // 查找 name 属性为 username 的文档
      collection.findOne({name: username}, function(err, doc) {
        mongodb.close();
        if (doc) {
          // 封装为 User 对象
          var user = new User(doc);
          var photo_url = "https://secure.gravatar.com/avatar/" + md5(user.email) + "?r=x";
          user.photo_url = photo_url;
          // console.log("photo_url --> ", user.photo_url);
          callback(err, user);
        } else {
          callback(err, null);
        }
      });
    });
  });
};

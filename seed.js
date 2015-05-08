// 初始化数据
var _ = require('underscore');
var crypto = require('crypto');
var User = require('./models/user.js');

var hash_users = [
  {
    name: 'admin',
    email: 'admin@gmail.com',
    password: 'admin',
    is_admin: true
  },
  {
    name: 'guest',
    email: 'guest@gmail.com',
    password: 'guest',
    is_admin: false
  }
];

_.each(hash_users, function(hash_user, index, list){
// for(var hash_user in hash_users) {
  var md5 = crypto.createHash('md5');
  console.log(hash_user.password);
  hash_user.password = md5.update(hash_user.password).digest('base64');
  var newUser = new User(hash_user);

  User.get(newUser.name, function(err, user) {
    var name = newUser.name;
    if (user){
      console.error('用户' + name + '已经存在', err);
    } else {
      newUser.save(function(err) {
        if (err) {
          console.error('添加用户' + name + '失败', err);
        } else {
          console.log('成功添加用户' + name);
        }
      });
    }
  });
// }
});

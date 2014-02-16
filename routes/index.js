var _ = require('underscore');
var crypto = require('crypto');
var User = require('../models/user.js');
var Post = require('../models/post.js');

module.exports = function(app) {
  app.get('/', function(req, res) { 
    Post.get(null, function(err, posts) {
      if (err) {
        posts = [];
      }
      res.render('index', {
        title: '首页',
        posts: posts,
      });
    });
  });
  
  app.get('/reg', checkNotLogin);
  app.get('/reg', function(req, res) {
    res.render('reg', {
      title: '用户注册',
    });
  });
  
  app.post('/reg', checkNotLogin);
  app.post('/reg', function(req, res) {
    //检验用户名时候非空
    if(_.isEmpty(req.body['username'])) {
      return redirectWithError(req, res, '用户名不能为空', '/reg');
    }    
    //检验用户两次输入的密码是否一致
    if (req.body['password-repeat'] != req.body['password']) {
      return redirectWithError(req, res, '两次输入的密码不一致', '/reg');
    }
  
    //生成密码的散列值
    var md5 = crypto.createHash('md5');
    var password = md5.update(req.body.password).digest('base64');
    var newUser = new User({
      name: req.body.username,
      password: password,
    });
    
    //检验用户名是否已经存在
    User.get(newUser.name, function(err, user) {
      if (user)
        err = '用户已经存在';
      if (err) {
        return redirectWithError(req, res, err, '/reg');
      }
      //如果不存在则新增用户
      newUser.save(function(err) {
        if (err) {
          return redirectWithError(req, res, err, '/reg');
        }
        req.session.user = newUser;
        redirectWithSuccess(req, res, '注册成功', '/');
      });
    });
  });
  
  app.get('/login', checkNotLogin);
  app.get('/login', function(req, res) {
    res.render('login', {
      title: '用户登入',
    });
  });
  
  app.post('/login', checkNotLogin);
  app.post('/login', function(req, res) {
    //生成密码的散列值
    var md5 = crypto.createHash('md5');
    var password = md5.update(req.body.password).digest('base64');
    
    User.get(req.body.username, function(err, user) {
      if (!user) {
        return redirectWithError(req, res, '用户不存在', '/login');
      }
      if (user.password != password) {
        return redirectWithError(req, res, '用户密码错误', '/login');
      }
      req.session.user = user;
      var message = '登入成功。欢迎您' + user.name + "！";
      redirectWithSuccess(req, res, message, '');
    });
  });
  
  app.get('/logout', checkLogin);
  app.get('/logout', function(req, res) {
    req.session.user = null;
    redirectWithSuccess(req, res, '登出成功', '/');
  });

  app.post('/post', checkLogin); 
  app.post('/post', function(req, res) {
    var currentUser = req.session.user;
    var post = new Post(currentUser.name, req.body.post); 
    post.save(function(err) {
      if (err) {
        return redirectWithError(req, res, err, '/');
      }
      redirectWithSuccess(req, res, '发表成功', '/u/' + currentUser.name);
    }); 
  });

  app.get('/u/:user', function(req, res) { 
    // \/user\/([^\/]+)\/?
    User.get(req.params.user, function(err, user) {
      if (!user) {
        return redirectWithError(req, res, '用户不存在', '/');
      }
      Post.get(user.name, function(err, posts) {
        if (err) { 
          return redirectWithError(req, res, err, '/');
        }
        res.render('user', {
          title: user.name,
          posts: posts,
        });
      }); 
    });
  });
};

function redirectWithSuccess(req, res, message, url) {
  req.flash('success', message);
  return res.redirect(url);
}

function redirectWithError(req, res, message, url) {
  req.flash('error', message);
  return res.redirect(url);
}

function checkLogin(req, res, next) {
  if (!req.session.user) {
    return redirectWithError(req, res, '未登入', '/login');
  }
  next();
}

function checkNotLogin(req, res, next) {
  if (req.session.user) {
    return redirectWithError(req, res, '已登入', '/');
  }
  next();
}

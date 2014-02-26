var _ = require('underscore');
var crypto = require('crypto');
var Tool = require('../models/tool.js');
var User = require('../models/user.js');
var Post = require('../models/post.js');

module.exports = function(app) {
  app.get('/', function(req, res) {
    // throw new Error('An error for test purposes.');
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

  app.get('/admin', checkAdminLogin);
  app.get('/admin', function(req, res) {
    currentUser = req.session.user;
    Post.get(currentUser.username, function(err, posts) {
      if (err) {
        posts = [];
      }
      res.render('admin/index', {
        title: '微博管理首页',
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
    var username = req.body['username'].trim();
    if(!/^([0-9]|[a-z]|[A-Z]){2,}$/.test(username)) {
      return redirectWithError(req, res, '用户名必须为2个以上字符', '/reg');
    }
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if(!re.test(req.body['email'])) {
      return redirectWithError(req, res, '邮箱格式不正确', '/reg');
    }
    var password = req.body['password'].trim();
    if(!/^([0-9]|[a-z]|[A-Z]){2,}$/.test(password)) {
      return redirectWithError(req, res, '密码必须为2个以上字符', '/reg');
    }
    //检验用户两次输入的密码是否一致
    if (req.body['password-repeat'].trim() != password) {
      return redirectWithError(req, res, '两次输入的密码不一致', '/reg');
    }
  
    //生成密码的散列值
    var md5 = crypto.createHash('md5');
    var password = md5.update(req.body.password).digest('base64');
    var newUser = new User({
      name: req.body.username,
      email: req.body.email,
      password: password,
      is_admin: false
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
        redirectWithSuccess(req, res, '注册成功，登录之后畅享微博', '/');
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
      if (user.is_admin) {
        var message = '登入成功。欢迎管理员' + user.name + "！";
        redirectWithSuccess(req, res, message, '/admin');
      } else {
        var message = '登入成功。欢迎您' + user.name + "！";
        redirectWithSuccess(req, res, message, '');
      }
    });
  });
  
  app.get('/logout', checkLogin);
  app.get('/logout', function(req, res) {
    req.session.user = null;
    redirectWithSuccess(req, res, '登出成功', '/');
  });

  app.post('/post', checkLogin); 
  app.post('/post', function(req, res) {
    if (_.isEmpty(req.body.post.trim())) {
      return redirectWithError(req, res, '发布内容不能为空', '/');
    }
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
    return redirectWithError(req, res, '未登录为普通用户', '/login');
  }
  next();
}

function checkNotLogin(req, res, next) {
  if (req.session.user) {
    return redirectWithError(req, res, '已登录为普通用户', '/');
  }
  next();
}

function checkAdminLogin(req, res, next) {
  var user = req.session.user;
  if (!(user && user.is_admin)) {
    return redirectWithError(req, res, '未登录为管理员', '/login');
  }
  next();
}

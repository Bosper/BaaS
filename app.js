var express     = require('express');
var app = express();

var session     = require('express-session');
var cookie      = require('cookie-parser');
var cors        = require('cors');
var morgan      = require('morgan');
var path        = require('path');
var bodyParser  = require('body-parser');
var config      = require('./config/config')
var jwt         = require('jsonwebtoken');

var sess = {
  secret: config.secret,
  cookie: {}
}

// configure app
app.use(morgan('dev'));

app.use(bodyParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cors());

app.use(session({
    secret: config.secret,
    resave: true,
    saveUninitialized: true
}));

// Authentication and Authorization Middleware
var auth = function(req, res, next) {
  if (req.session && req.session.user === "uland" && req.session.admin)
    return next();
  else
    return res.sendStatus(401);
};

var mongoose    = require('mongoose');
// var bcrypt      = require(bcrypt);
// const SALT_WORK_FACTOR = 10;

var Test        = require('./model/test');
var User        = require('./model/user.schema');

mongoose.connect('mongodb://localhost:27017/lounge');
app.set('secret', config.secret);

app.get('/', function(req, res) {
    res.json({ message: 'hooray! welcome to our api!' });
});

app.get('/test', function(req, res) {
    Test.find(function(err, data) {
            if (err) {
                res.send(err);
            } else {
                res.header({
                     'Content-Type': 'application/json',
                     'Access-Control-Allow-Origin': '*',
                     'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE',
                });
                res.json(data);
                console.log(data);
            }
        });
});

// Get content endpoint
app.get('/connect', auth, function (req, res) {
    res.json("You can only see this after you've logged in.");
});

app.post('/login', function (req, res) {
<<<<<<< Updated upstream
    console.log("Recived login request!");
    console.log("Request: ", req.body, req.body.username);
    res.header({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE',
        'Accept': 'q=0.8;application/json;q=0.9'
    })
    res.end();
});

app.post('/authenticate', function(req, res) {

  // find the user
  User.findOne({
    username: req.body.username
  }, function(err, user) {

    if (err) throw err;

    if (!user) {
      res.json({ success: false, message: 'Authentication failed. User not found.' });
    } else if (user) {

      // check if password matches
      if (user.password != req.body.password) {
        res.json({ success: false, message: 'Authentication failed. Wrong password.' });
      } else {

        // if user is found and password is right
        // create a token
        var token = jwt.sign(user, app.get('secret'), {
          expiresIn: 60*60*24 // expires in 24 hours
        });

        // return the information including token as JSON
        res.json({
          success: true,
          message: 'Enjoy your token!',
          token: token
        });
      }

    }

  });
});

app.get('/users', function(req, res) {
    User.find(function(err, users) {
        if (err) {
            res.send(err);
        } else {
            res.header({
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE',
            });
            res.json(users);
            console.log(users);
        }
    });
});

app.get('/adduser', function (req, res) {

    var Uland = new User({
        username: 'uland',
        password: 'anno1602'
    }, {
        _id: false,
        collection: 'users'
    });

    Uland.save(function (err) {
        if (err) throw err;

        console.log(Uland.username, 'has been saved.');
        res.json({ success: true })
    });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  app.set('trust proxy', 1); // trust first proxy
  sess.cookie.secure = true; // serve secure cookies
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;

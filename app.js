var express     = require('express');
var app = express();

var session     = require('express-session');
<<<<<<< HEAD
var cookie      = require('cookie-parser');
=======
>>>>>>> f885ef077350118f5356dae7449b236fe5ccd7e6
var cors        = require('cors');
var morgan      = require('morgan');
var path        = require('path');
var bodyParser  = require('body-parser');
var config      = require('./config/config')
var jwt         = require('jsonwebtoken');

<<<<<<< HEAD
var sess = {
  secret: config.secret,
  cookie: {}
}

=======
>>>>>>> f885ef077350118f5356dae7449b236fe5ccd7e6
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

//app.set('trust proxy', 1) // trust first proxy

var apiRoutes = express.Router();

apiRoutes.use(function (req, res, next) {
  var token = req.body.token || req.query.token || req.headers['x-access-token'];
  console.log(token);
  if (token) {
    // verifies secret and checks exp
    jwt.verify(token, app.get('secret'), function (err, decoded) {
      if (err) {
        return res.json({success: false, message: 'Failed to authenticate token.', token: "empty"});
      } else {
        // if everything is good, save to request for use in other routes
       req.decoded = decoded;
       next();
      }
    });
  } else {
    // if there is no token
    // return an error
    return res.status(403).send({
        success: false,
        message: 'No token provided.',
        token: "empty"
    });
  }
});

app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, PATCH, DELETE');
    next();
});

//app.use(session({ secret: config.secret, cookie: { maxAge: 60000 }}));

// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   var err = new Error('Not Found');
//   err.status = 404;
//   next(err);
// });

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.json({
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

app.get('/', function(req, res) {
    res.json({ message: 'hooray! welcome to our api!' });
});

app.get('/api/test', function(req, res) {
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

<<<<<<< HEAD
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

=======
app.post('/api/authenticate', function(req, res) {
>>>>>>> f885ef077350118f5356dae7449b236fe5ccd7e6
  // find the user
  console.log(req.body);
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
          expiresIn: 60*2 // expires in 24 hours
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

app.get('/api/adduser', function (req, res) {

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

<<<<<<< HEAD
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


=======
app.use('/api/tokenCheck', apiRoutes);
app.post('/api/tokenCheck', function (req, res) {
    res.send({
      success: true,
      message: "Token verified"
    });
});

>>>>>>> f885ef077350118f5356dae7449b236fe5ccd7e6
module.exports = app;

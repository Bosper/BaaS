var express     = require('express');
var session     = require('express-session');
var app = express();


var cookie      = require('cookie-parser');
var cors        = require('cors');
var morgan      = require('morgan');
var path        = require('path');
var bodyParser  = require('body-parser');
var config      = require('./config/config')
var jwt         = require('jsonwebtoken');
var mongoose    = require('mongoose');

var Test        = require('./model/test');
var User        = require('./model/user.schema');

var sess = {
    secret: config.secret,
    cookie: {
        maxAge: 60000,
        httpOnly: false
    }
}
app.use(session(sess))
// configure app
app.use(morgan('dev'));

app.use(bodyParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cookie())

app.use(cors());

app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, PATCH, DELETE');
    next();
});

app.set('secret', config.secret);

if (app.get('env') === 'production') {
    app.set('trust proxy', 1) // trust first proxy
    sess.cookie.secure = true // serve secure cookies
}



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

mongoose.connect('mongodb://localhost:27017/lounge');


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

app.post('/api/authenticate', function(req, res) {

    if(req.session.lastPage) {
     res.json({LastPage: req.session.lastPage});
   }
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
        // save token to userModel
        // user.token = token;
        // user.save();

        console.log(user.token);
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

app.get('/api/adduser', function (req, res) {

    var Uland = new User({
        username: 'uland',
        password: 'anno1602',
        token: ""
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

app.use('/api/tokenCheck', apiRoutes);
app.post('/api/tokenCheck', function (req, res) {
    res.header({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE',
        'Accept': 'q=0.8;application/json;q=0.9'
    })
    res.send({
      success: true,
      message: "Token verified"
    });
});

app.post('/api/token', function (req, res) {
    User.findOne({token: req.body.token}, function (err, user) {
        if (err) throw err;
        else if (!user) res.json({message: "No user found"})
        else {
            res.send(user);
            console.log("User: ", user);
        }
    });
})

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
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;

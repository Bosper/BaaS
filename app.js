var express     = require('express');
var app         = express();
var session     = require('express-session');
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
var Album       = require('./model/album.schema');
var Photo       = require('./model/photo.schema');
var sess = {
    secret: config.secret,
    cookie: {
        maxAge: 60000,
        httpOnly: false
    }
}
//CONNECT to DB
mongoose.connect(config.db);
mongoose.connection.on('open', function () {
    console.error('Mongo is open.');


});

var apiRoutes = express.Router();
var newID = express.Router();

// configure app
app.set('secret', config.secret);
app.use(session(sess))
app.use(morgan('dev'));
app.use(bodyParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookie())
app.use(cors());
app.use('/api/tokenCheck', apiRoutes);
app.use('/api/createAlbum', newID);
app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, PATCH, DELETE');
    next();
});

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

//TOKEN  VERIFY for URL
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
    // if there is no token return an error
    return res.status(403).send({
        success: false,
        message: 'No token provided.',
        token: "empty"
    });
  }
});

// ID MIDDLEWARE
newID.use(function (req, res, next) {
    var _newAlbumID;
    Album.findOne().sort('-id').exec(function (err, album, newID) {
        if (err) throw err;
        var test = ++album.id;
        _newAlbumID = test;
        console.log("IN: ", test, _newAlbumID);
        req.body.id = _newAlbumID;
        next();
    });
});

// AUTH ROUTES
// find user
app.post('/api/authenticate', function(req, res) {
  console.log(req.body);
  sess = req.session;
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
        sess.token = token;
        console.log("SESS TOKEN: ", sess.token);
      }
    }
  });
});
// add User
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
// token Verify
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

// API ROUTES
app.get('/api/navigation', function (req, res) {
    res.json([
            { id: 1, title: "portrait", url: "/portrait", active: false, display: true, category: 1 },
            { id: 2, title: "editorial", url: "/editorial", active: false, display: true, category: 2 },
            { id: 99, title: "vision", url: "/editorial", active: false, display: true, category: 3 }
        ]);
});

app.get('/api/albums', function (req, res) {
    Album.find({}, function (err, docs) {
        if(err) throw err;
        res.json(docs);
    });
    //res.json({status: "OK", target: "albums", method: "GET"});
});

app.get('/api/photos', function (req, res) {
    Photo.find({}, function (err, docs) {
        if(err) throw err;
        res.json(docs);
    });
    //res.json({status: "OK", target: "photos", method: "GET"});
});

app.post('/api/photos', function (req, res) {
    res.json({status: "OK", target: "photos", method: "POST"});
});

app.post('/api/createAlbum', function (req, res) {
    var newAlbum = new Album(req.body);
    console.log("NEW ID: ", req.body);
    newAlbum.save(function (err) {
        if (err) throw err;
        console.log(newAlbum, 'has been saved.');
    });
    res.json({success: "OK", message: "albums", error: "none"});
    res.end();
});

app.post('/api/updateAlbum', function (req, res) {
    var newAlbum = new Album(req.body);
    console.log(newAlbum);
    res.json({success: "OK", message: "UPDATE", error: "none"});
    res.end();
});

module.exports = app;

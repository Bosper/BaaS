var express     = require('express');
var app = express();

var morgan      = require('morgan');
var path        = require('path');
var bodyParser  = require('body-parser');
var config      = require('./config/config')
var jwt         = require('jsonwebtoken');

// configure app
app.use(morgan('dev'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

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
                     'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
                });
                res.json(data);
                console.log(data);
            }
        });
});

app.get('/users', function (req, res) {
    User.find(function(err, data) {
        if (err) {
            res.send(err);
        } else {
            res.header({
                 'Content-Type': 'application/json',
                 'Access-Control-Allow-Origin': '*',
                 'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE',
                 'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
            });
            res.json(data);
            console.log(data);
        }
    });
});

app.post('/login', function (req, res) {
    console.log("Recived login request!");
    console.log(req.body);
});

app.post('/authenticate', function(req, res) {

  // find the user
  User.findOne({
    name: req.body.name
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
        var token = jwt.sign(user, app.get('superSecret'), {
          expiresInMinutes: 1440 // expires in 24 hours
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


app.get('/adduser', function (req, res) {

    var Uland = new User({
        username: 'uland',
        password: 'password'
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



// app.get('/test', function (req, res) {
//     console.log('Recived GET request!');
//     res.json({ message: 'Recived GET request!' });
//
// })


module.exports = app;

var express     = require('express');
var app = express();

var morgan      = require('morgan');
var path        = require('path');
var bodyParser  = require('body-parser');


// configure app
app.use(morgan('dev'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var mongoose    = require('mongoose');
var Test        = require('./model/test');
mongoose.connect('mongodb://localhost:27017');

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
                     'Access-Control-Allow-Origin': 'http://localhost:8080',
                     'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE'
                });
                // res.header('Access-Control-Allow-Origin', 'http://localhost:8080');
                // res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
                res.json(data);
                console.log(data);
            }
        });
});

// app.get('/test', function (req, res) {
//     console.log('Recived GET request!');
//     res.json({ message: 'Recived GET request!' });
//
// })


module.exports = app;

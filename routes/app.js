var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
    res.render('index');
});

router.get('/welcome', function (req, res, next) {
    res.render('index');
});

router.get('/authentication', function (req, res, next) {
    res.render('index');
});

module.exports = router;
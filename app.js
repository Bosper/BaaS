const DIR       = './public/pictures/';
const UPLOAD    = 'http://127.0.0.1:3005/static/pictures/';

var express     = require('express');
var app         = express();
var session     = require('express-session');
var cookie      = require('cookie-parser');
var cors        = require('cors');
var morgan      = require('morgan');
var path        = require('path');
var bodyParser  = require('body-parser');
var jwt         = require('jsonwebtoken');
var mongoose    = require('mongoose');
var multer      = require('multer');
var mime        = require('mime');
var storage     = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, DIR)
    },
    filename: function (req, file, cb) {
        var path = file.fieldname + '-' + Date.now() + '.' + mime.extension(file.mimetype);
        cb(null, path);
        req.body.path = path;
        console.log("FILENAME: ", file, "PATH: ", path);
    }
});
var upload      = multer({storage: storage}).any();

var appRoutes   = require('./routes/app');

var config      = require('./config/config');
var Test        = require('./model/test');
var User        = require('./model/user.schema');
var Album       = require('./model/album.schema');
var Photo       = require('./model/photo.schema');
var Page        = require('./model/page.schema');
var Panel        = require('./model/panelMenu.schema');
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
var newPhotoID = express.Router();
var auth = express.Router();
var updateAlbum = express.Router();
var createAlbum = express.Router();
var updatePhoto = express.Router();

// configure app
app.set('secret', config.secret);
// view engine setup
app.set('views', path.join(__dirname, 'public/dist'));
app.set('view engine', 'hbs');
// session setup
app.use(session(sess))
app.use(morgan('dev'));
app.use(bodyParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookie());
app.use('/', appRoutes);
app.use('/api/tokenCheck', apiRoutes);
app.use('/api/uploadPhotos', newPhotoID);
app.use('/api/createAlbum', newID);
app.use('/api/authenticate', auth);
app.use('/api/updateAlbum', updateAlbum);
app.use('/api/createAlbum', updateAlbum);
app.use('/api/updatePhoto', updatePhoto);
app.use('/static', express.static('public'));
app.use(express.static('public/dist'));
app.use(function(req, res, next) {
    //res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3005');
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

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
  res.json({
    message: err.message,
    error: {}
  });
});

//TOKEN  VERIFY for URL
apiRoutes.use(cors(),function (req, res, next) {
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

auth.use(cors(), function (req, res, next) {
    next();
});

updateAlbum.use(cors(), function (req, res, next) {
    next();
});

createAlbum.use(cors(), function (req, res, next) {
    next();
});

updatePhoto.use(cors(), function (req, res, next) {
    next();
});

// ID MIDDLEWARE
newID.use(function (req, res, next) {
    var _newAlbumID;
    Album.findOne().sort('-id').exec(function (err, album) {
        if (err) return handleError(err);
        else if (!album) {
            _newAlbumID = 1;
            req.body.id = _newAlbumID;
            console.log("NO ALBUM");
            next();
        } else {
            var test = ++album.id;
            _newAlbumID = test;
            console.log("IN: ", test, _newAlbumID);
            req.body.id = _newAlbumID;
            next();
        }
    });
});

newPhotoID.use(function (req, res, next) {
    var _newPhotoID;
    Photo.findOne().sort('-id').exec(function (err, photo, newID) {
        if (err) throw err;
        var test = photo.id;
        _newPhotoID = ++test;
        console.log("IN: ", photo.id, _newPhotoID);
        req.body.id = _newPhotoID;
    });
    next();
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
    // res.header({
    //     'Content-Type': 'application/json',
    //     'Access-Control-Allow-Origin': '*',
    //     'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE',
    //     'Accept': 'q=0.8;application/json;q=0.9'
    // });
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
            { id: 99, title: "vision", url: "/vision", active: false, display: true, category: 3 }
        ]);
});

app.get('/api/albums', function (req, res) {
    Album.find({}, function (err, docs) {
        if(err) throw err;
        res.json(docs);
    });
    //res.json({status: "OK", target: "albums", method: "GET"});
});


//SITE PAGES
app.get('/api/bio', function (req, res) {
    Page.find({id: 1}, function (err, page) {
        if (err) throw err;
        console.log(page);
        res.json(page);
    })
});

app.get('/api/photos', function (req, res) {
    Photo.find({}, function (err, docs) {
        if(err) throw err;
        res.json(docs);
    });
    //res.json({status: "OK", target: "photos", method: "GET"});
});

app.get('/api/panelnav', function (req, res) {
    Panel.find({}, function (err, docs) {
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
    //var newAlbum = new Album(req.body);
    //console.log(newAlbum);
    Album.findOne({id: req.body.id}, function (err, album) {
        if (err) throw err;
        if (!album) {
            res.json({success: "FALSE", message: "ALBUM NOT FOUND", error: "TRUE"})
        } else if (album) {
            album.title = req.body.title;
            album.photoId = req.body.photoId;
            album.start = req.body.start;
            album.category = req.body.category;
            album.desc = req.body.desc;
            album.order = req.body.order;
            album.active = req.body.active;
            album.cover = req.body.cover;
            album.save(function (err, updatedAlbum) {
                if (err) return err;
                console.log("Updated Album: ", updatedAlbum);
                res.json({success: "OK", message: "Album has been udated", error: "none"})
            });
        }
    });
});

app.post('/api/updatePhoto', function (req, res) {
    var id = req.body.id;

    Photo.findOne({id: id}, function (err, photo) {
        if (err) throw err;
        if(!photo) {
            res.json({success: "FALSE", message: "Photo has NOT been updated", error: "TRUE"})
        } else if (photo) {
            photo.active = req.body.display;
            photo.order = req.body.order;

            photo.save(function (err, updatedPhoto) {
                if (err) throw err;
                res.json({success: "OK", message: "Photo has been updated", error: "none"})
            })
        }
    })
})

app.post('/api/uploadPhotos', function (req, res) {
    upload(req, res, function (err) {
        if (err) {
            return res.end(err.toString());
        } else {
            newPhoto = new Photo({
                id: req.body.id,
                order: 1,
                active: true,
                url: UPLOAD + req.body.path
            });

            newPhoto.save(function (err) {
                if (err) throw err;
                res.json({success: true, message: 'File has been uploaded!', err: 'none'});
            });
            //res.end();
        };
  });
});

//DASHBOARD PAGES
app.get('/api/pages', function (req, res) {
    Page.find({}, function (err, pages) {
        if (err) throw err;
        console.log(pages);
        res.json(pages)
    });
});

module.exports = app;

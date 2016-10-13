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

app.get('/login', function (req, res) {
    User.find(function(err, users) {
        if (err) {
            res.send(err);
        } else {
            res.header({
                 'Content-Type': 'application/json',
                 'Access-Control-Allow-Origin': '*',
                 'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE',
                 'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
            });
            res.json(users);
            console.log(users);
        }
    });
});

app.post('/login', function (req, res) {
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

module.exports = Routes;

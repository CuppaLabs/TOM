/**
 * Cuppa OAuth Node Server
 * (c) 2016 Cuppa Labs
 * License: MIT
 */

var path = require('path');
var qs = require('querystring');

var async = require('async');
var bcrypt = require('bcryptjs');
var bodyParser = require('body-parser');
var cors = require('cors');
var express = require('express');
var logger = require('morgan');
var jwt = require('jwt-simple');
var moment = require('moment');
var mongoose = require('mongoose');
var request = require('request');
var config = require('./auth-config');

var topic = "dailyNotifications";


var userSchema = new mongoose.Schema({
    email: { type: String, lowercase: true },
    password: { type: String, select: false },
    name: { type: String },
    picture: { type: String },
    credits: { type: Number }
});

var postSchema = new mongoose.Schema({
    title: { type: String },
    category: { type: String },
    content: { type: String },
    description: { type: String },
    publisherId: { type: String }
});

var articleSchema = new mongoose.Schema({
    title: { type: String },
    category: { type: String },
    description: { type: String },
    link: { type: String },
    publisherId: { type: String }
})

userSchema.pre('save', function (next) {
    var user = this;
    if (!user.isModified('password')) {
        return next();
    }
    bcrypt.genSalt(10, function (err, salt) {
        bcrypt.hash(user.password, salt, function (err, hash) {
            user.password = hash;
            next();
        });
    });
});

userSchema.methods.comparePassword = function (password, done) {
    bcrypt.compare(password, this.password, function (err, isMatch) {
        done(err, isMatch);
    });
};

var User = mongoose.model('User', userSchema);
var Post = mongoose.model('Post', postSchema);
var Article = mongoose.model('Article', articleSchema);

mongoose.connect(config.MONGO_URI, {
    useMongoClient: true,
    /* other options */
});
mongoose.connection.on('error', function (err) {
    console.log('Error: Could not connect to MongoDB. Did you forget to run `mongod`?'.red);
});

var app = express();

app.set('port', process.env.PORT || 5000);
//app.set('host', process.env.NODE_IP || 'localhost');
app.use(cors());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Force HTTPS on Heroku
if (app.get('env') === 'production') {
    app.use(function (req, res, next) {
        var protocol = req.get('x-forwarded-proto');
        protocol == 'https' ? next() : res.redirect('https://' + req.hostname + req.url);
    });
}
app.use(express.static(path.join(__dirname, '/dist')));


/*function subscribeToNews() {
    User.find((err, devices) => {
        if (!err && devices) {
            let androidDevices = [];
            devices.forEach(device => {
                if (device.deviceId && device.deviceId !== "") {
                    androidDevices.push(device.deviceId);
                }

            });
            admin.messaging().subscribeToTopic(androidDevices, topic)
                .then(function (response) {
                    // See the MessagingTopicManagementResponse reference documentation
                    // for the contents of response.
                    console.log('Successfully subscribed to topic:', response);
                })
                .catch(function (error) {
                    console.log('Error subscribing to topic:', error);
                });
        }
    });
}*/
//subscribeToNews();
/*
 |--------------------------------------------------------------------------
 | Login Required Middleware
 |--------------------------------------------------------------------------
 */
function ensureAuthenticated(req, res, next) {
    if (!req.header('Authorization')) {
        return res.status(401).send({ message: 'Please make sure your request has an Authorization header' });
    }
    var token = req.header('Authorization').split(' ')[1];

    var payload = null;
    try {
        payload = jwt.decode(token, config.TOKEN_SECRET);
    }
    catch (err) {
        return res.status(401).send({ message: err.message });
    }

    if (payload.exp <= moment().unix()) {
        return res.status(401).send({ message: 'Token has expired' });
    }
    req.user = payload.sub;
    next();
}

/*
 |--------------------------------------------------------------------------
 | Generate JSON Web Token
 |--------------------------------------------------------------------------
 */
function createJWT(user) {
    var payload = {
        sub: user._id,
        iat: moment().unix(),
        exp: moment().add(14, 'days').unix()
    };
    return jwt.encode(payload, config.TOKEN_SECRET);
}

function getUserEmail() {

}

/*
 |--------------------------------------------------------------------------
 | GET /api/me
 |--------------------------------------------------------------------------
 */
app.get('/api/profile', ensureAuthenticated, function (req, res) {
    User.findById(req.user, function (err, user) {
        res.send(user);
    });
});

/*
 |--------------------------------------------------------------------------
 | PUT /api/me
 |--------------------------------------------------------------------------
 */
app.put('/api/me', ensureAuthenticated, function (req, res) {
    User.findById(req.user, function (err, user) {
        if (!user) {
            return res.status(400).send({ message: 'User not found' });
        }
        user.displayName = req.body.displayName || user.displayName;
        user.email = req.body.email || user.email;
        user.save(function (err) {
            res.status(200).end();
        });
    });
});


/*
 |--------------------------------------------------------------------------
 | Log in with Email
 |--------------------------------------------------------------------------
 */
app.post('/auth/login', function (req, res) {
    User.findOne({ email: req.body.email }, '+password', function (err, user) {
        if (!user) {
            return res.status(401).send({ message: 'Invalid email and/or password' });
        }
        user.comparePassword(req.body.password, function (err, isMatch) {
            if (!isMatch) {
                return res.status(401).send({ message: 'Invalid email and/or password' });
            }
            User.findOne({ _id: user }, 'name email', function (err, user) {
                   res.send({ token: createJWT(user), user: user });     
                });
            
        });
    });
});

/*
 |--------------------------------------------------------------------------
 | Create Email and Password Account
 |--------------------------------------------------------------------------
 */
app.post('/auth/signup', function (req, res) {
    User.findOne({ email: req.body.email }, function (err, existingUser) {
        if (existingUser) {
            return res.status(409).send({ message: 'Email is already taken' });
        }
        var user = new User({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            credits: 0
        });
        user.save(function (err, result) {
            if (err) {
                res.status(500).send({ message: err.message });
            }
            res.send({ token: createJWT(result) });
        });
    });
});

app.post('/post/create', ensureAuthenticated, function (req, res) {

    var post = new Post({
        title: req.body.title,
        category: req.body.category,
        content: req.body.content,
        description: req.body.description,
        publisherId: req.user
    });
    post.save(function (err, result) {
        if (err) {
            res.status(500).send({ message: err.message });
        }
        res.send(200).end();
    });
});

app.post('/article/create', ensureAuthenticated, function (req, res) {

    var article = new Article({
        title: req.body.title,
        category: req.body.category,
        description: req.body.description,
        link: req.body.link,
        publisherId: req.user
    });
    article.save(function (err, result) {
        if (err) {
            res.status(500).send({ message: err.message });
        }
        res.send(200).end();
    });
});

app.get('/post/getAll', function (req, res) {

    Post.find({}, '_id title category content description publisherId', function (err, posts) {
        if (err) {
            res.status(500).send({ message: err.message });
        }
        var len = posts.length;
        var resArr = [];
        var currIndex = 0;
        if (len > 0) {
            posts.forEach(post => {

                User.findOne({ _id: post.publisherId }, 'name email', function (err, user) {
                    var tempObj = {};
                    tempObj = Object.assign(tempObj, post);
                    tempObj._doc['user'] = user;
                    resArr.push(tempObj._doc);
                    ++currIndex;
                    if (currIndex == len) {
                        res.send(resArr).end();
                    }
                });

            });
        }
        else {
            res.send(resArr).end();
        }

    });
});

app.get('/article/getAll', function (req, res) {

    Article.find({}, '_id title category description link publisherId', function (err, articles) {
        if (err) {
            res.status(500).send({ message: err.message });
        }
        var len = articles.length;
        var resArr = [];
        var currIndex = 0;
        if (len > 0) {
            articles.forEach(article => {

                User.findOne({ _id: article.publisherId }, 'name email', function (err, user) {
                    var tempObj = {};
                    tempObj = Object.assign(tempObj, article);
                    tempObj._doc['user'] = user;
                    resArr.push(tempObj._doc);
                    ++currIndex;
                    if (currIndex == len) {
                        res.status(200).send(resArr).end();
                    }
                });

            });
        }
        else {
            res.status(200).send(resArr).end();
        }


    });
});

app.get('/user/getAll', function (req, res) {

    User.find({}, '_id name email credits', function (err, users) {
        if (err) {
            res.status(500).send({ message: err.message });
        }
        res.status(200).send(users).end();
    });
});



/*app.post('/notifications/send', function (req, res) {
    var registrationToken = 'creFgPPXFYk:APA91bFCIn3U_Q5Q-O4Rq3jkntiefX-hYbBXCgxhlFEqpCYgx8XIhgkhUv6BYHQf3yNvFt2EwnyCIVCUY28JqgAEXq1B9skBY0Du-mOFeaR4n6MubQrFxY4XJA5z81cS2_g5kLEXkX4N7A_aObZs2jO4PjEFeWXcbA';

    var message = {
        android: {
            ttl: 3600 * 1000, // 1 hour in milliseconds
            priority: 'normal',
            notification: {
                title: '$GOOG up 1.43% on the day',
                body: '$GOOG gained 11.80 points to close at 835.67, up 1.43% on the day.',
                icon: 'stock_ticker_update',
                color: '#f45342'
            }
        },
        topic: topic
    };
    admin.messaging().send(message)
        .then((response) => {
            // Response is a message ID string.
            console.log('Successfully sent message:', response);
            res.status(200).end();
        })
        .catch((error) => {
            console.log('Error sending message:', error);
            res.status(500).end();
        });

    /*     User.findOne({ email: req.body.email }, '+password', function(err, user) {
          if (!user) {
            return res.status(401).send({ message: 'Invalid email and/or password' });
          }
          user.comparePassword(req.body.password, function(err, isMatch) {
            if (!isMatch) {
              return res.status(401).send({ message: 'Invalid email and/or password' });
            }
            res.send({ token: createJWT(user) });
          });
        });
});*/


var clientId = 0;
var clients = {}; // <- Keep a map of attached clients

// Called once for each new client. Note, this response is left open!
app.get('/events', function (req, res) {
    req.socket.setTimeout(Number.MAX_VALUE);
    res.writeHead(200, {
        'Content-Type': 'text/event-stream', // <- Important headers
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    });
    res.write('\n');
    (function (clientId) {
        clients[clientId] = res; // <- Add this client to those we consider "attached"
        req.on("close", function () {
            delete clients[clientId]
        }); // <- Remove this client when he disconnects
    })(++clientId)
});

/* setInterval(function () {
    var msg = Math.random();
    console.log("Clients: " + Object.keys(clients) + " <- " + msg);
    for (clientId in clients) {
        clients[clientId].write("data: " + msg + "\n\n"); // <- Push a message to a single attached client
    };
}, 15000); */
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist/index.html'));
});

app.listen(app.get('port'), app.get('host'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});
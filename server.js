/**
 * Cuppa OAuth Node Server
 * (c) 2016 Cuppa Labs
 * License: MIT
 */

var path = require('path');
var qs = require('querystring');
var http = require('http');
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
var nodemailer = require('nodemailer');
var topic = "dailyNotifications";
var multer = require('multer');
var QRCode = require('qrcode');
var timestamps = require('mongoose-timestamp');

//var h5bp = require('h5bp');
var compression = require('compression');
var io = require('./io');
var sse = require('./io');
var sse = require('./sse');
var connections = [];


var userSchema = new mongoose.Schema({
    email: { type: String, lowercase: true },
    password: { type: String, select: false },
    name: { type: String },
    credits: { type: Number },
    quizScore: { type: Number },
    qrcode: { type: String },
    image: {type: String},
    description: {type: String}
});

var postSchema = new mongoose.Schema({
    title: { type: String },
    category: { type: String },
    content: { type: String },
    description: { type: String },
    publisherId: { type: String, ref: 'User' },
    createdOn: { type: Date }
});
postSchema.plugin(timestamps);
var articleSchema = new mongoose.Schema({
    title: { type: String },
    category: { type: String },
    description: { type: String },
    link: { type: String },
    publisherId: { type: String, ref: 'User' },
    createdOn: { type: Date }
});

var challengeSchema = new mongoose.Schema({
    statement: { type: String },
    category: { type: String },
    description: { type: String },
    publisherId: { type: String },
    createdOn: { type: Date },
    members: [userSchema]
});

var sessionSchema = new mongoose.Schema({
    session: { type: String },
    date: { type: Date },
    registrations: [userSchema],
    attendedUsers: [userSchema]
});

var feedbackSchema = new mongoose.Schema({
    name: { type: String },
    email: { type: String },
    feedback: { type: String },
    publisherId: { type: String },
    createdOn: { type: Date }
})

var questionSchema = new mongoose.Schema({
    quesNum: { type: Number },
    question: { type: String },
    optionA: { type: String },
    optionB: { type: String },
    optionC: { type: String },
    optionD: { type: String },
    answer: { type: String },
    users: [userSchema],
    rusers: [userSchema],
    wusers: [userSchema]
});
var activitySchema = new mongoose.Schema({
    description: { type: String },
    keyword: { type: String },
    type: { type: String},
    userId: { type: String, ref: 'User' }
});
activitySchema.plugin(timestamps);

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
var Challenge = mongoose.model('Challenge', challengeSchema);
var Feedback = mongoose.model('Feedback', feedbackSchema);
var Session = mongoose.model('Session', sessionSchema);
var Question = mongoose.model('Question', questionSchema);
var Activity = mongoose.model('Activity',activitySchema);

mongoose.connect(config.MONGO_URI, {
    useMongoClient: true,
    /* other options */
});
mongoose.connection.on('error', function (err) {
    console.log('Error: Could not connect to MongoDB. Did you forget to run `mongod`?'.red);
});

var app = express();
app.use(compression());

app.set('port', process.env.PORT || 5000);
//app.set('host', process.env.NODE_IP || 'localhost');
app.use(cors());
//app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(sse)

// Force HTTPS on Heroku
if (app.get('env') === 'production') {
    app.use(function (req, res, next) {
        var protocol = req.get('x-forwarded-proto');
        protocol == 'https' ? next() : res.redirect('https://' + req.hostname + req.url);
    });
}
//app.use(h5bp({ root: __dirname + '/dist' }));
app.use(express.static(path.join(__dirname, '/dist')));
app.use('/static', express.static(path.join(__dirname, '/presentations/static')))
const quizServer = http.createServer(app);
io(quizServer);
quizServer.listen(5300, (err) => {
    if (err) {
        console.log('could not start listening', err.message || err);
        process.exit();
    }
    console.log('app starting');
    console.log('Quiz server is listening on 5300');
});
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

var storage = multer.diskStorage({ //multers disk storage settings
    destination: function (req, file, cb) {
        cb(null, './uploads/');
    },
    filename: function (req, file, cb) {
        var datetimestamp = Date.now();
        cb(null, req.email + '-' + req.params.challengeId + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1]);
    }
});

var upload = multer({ //multer settings
    storage: storage
}).single('file');


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
app.get('/getAllNotifications', function (req, res) {

    var data = [{
        NotificationId: 122,
        NotificationTitle: "Notification Title",
        NotificationDesc: "Notification.NotificationDescEn",
        NotificationUrl: "Notification.NotificationUrl",
        NotificationSeverity: "D0021B",
        NotificationType: "Notification.NotificationType",
        ObjectDataId: "Notification.ObjectDataId",
        NotificationSource: "Notification.NotificationSource",
        Read: 0,
        ReadDt: "Notification.ReadDt",
        UserId: "Notification.UserId",
        CreatedTime: "14:20 20th October, 2018",
        UpdatedTime: "Notification.UpdatedTime"
    },{
        NotificationId: 132,
        NotificationTitle: "Notification Title",
        NotificationDesc: "Notification.NotificationDescEn",
        NotificationUrl: "Notification.NotificationUrl",
        NotificationSeverity: "F5A623",
        NotificationType: "Notification.NotificationType",
        ObjectDataId: "Notification.ObjectDataId",
        NotificationSource: "Notification.NotificationSource",
        Read: 0,
        ReadDt: "Notification.ReadDt",
        UserId: "Notification.UserId",
        CreatedTime: "14:20 20th October, 2018",
        UpdatedTime: "Notification.UpdatedTime"
    },{
        NotificationId: 200,
        NotificationTitle: "Notification Title",
        NotificationDesc: "Notification.NotificationDescEn",
        NotificationUrl: "Notification.NotificationUrl",
        NotificationSeverity: "7ED321",
        NotificationType: "Notification.NotificationType",
        ObjectDataId: "Notification.ObjectDataId",
        NotificationSource: "Notification.NotificationSource",
        Read: 1,
        ReadDt: "Notification.ReadDt",
        UserId: "Notification.UserId",
        CreatedTime: "14:20 20th October, 2018",
        UpdatedTime: "Notification.UpdatedTime"
    },{
        NotificationId: 300,
        NotificationTitle: "Notification Title",
        NotificationDesc: "Notification.NotificationDescEn",
        NotificationUrl: "Notification.NotificationUrl",
        NotificationSeverity: "9B9B9B",
        NotificationType: "Notification.NotificationType",
        ObjectDataId: "Notification.ObjectDataId",
        NotificationSource: "Notification.NotificationSource",
        Read: 0,
        ReadDt: "Notification.ReadDt",
        UserId: "Notification.UserId",
        CreatedTime: "14:20 20th October, 2018",
        UpdatedTime: "Notification.UpdatedTime"
    }];
    res.send(data).end();
});
app.get('/statistics', function (req, res) {

    var data = {};

    User.find({}, function (err, users) {
        if (err) {
            res.status(500).send();
        }
        data["users"] = users.length;
        var totalCredits =0;
        users.forEach(user => {
            totalCredits += user.credits;
        });
        data["credits"] = totalCredits;
        Post.find({}, function (err, posts) {
            if (err) {
                res.status(500).send();
            }
            data["posts"] = posts.length;
            Article.find({}, function (err, articles) {
                if (err) {
                    res.status(500).send();
                }
                data["articles"] = articles.length;
                Challenge.find({}, function (err, challenges) {
                    if (err) {
                        res.status(500).send();
                    }
                    data["challenges"] = challenges.length;
                    Feedback.find({}, function (err, feedbacks) {
                        if (err) {
                            res.status(500).send();
                        }
                        data["feedbacks"] = feedbacks.length;
                        Session.find({}, function (err, sessions) {
                            if (err) {
                                res.status(500).send();
                            }
                            data["sessions"] = sessions.length;
                            Question.find({}, function (err, questions) {
                                if (err) {
                                    res.status(500).send();
                                }
                                data["questions"] = questions.length;
                                res.send(data).end();
                            });
                            
                        });
                    });
                });
            });
        });
    });
});
app.post('/question/create', ensureAuthenticated, function (req, res) {

    var question = new Question({
        question: req.body.question,
        optionA: req.body.optionA,
        optionB: req.body.optionB,
        optionC: req.body.optionC,
        optionD: req.body.optionD,
        answer: req.body.answer
    });
    question.save(function (err, result) {
        if (err) {
            res.status(500).send({ message: err.message });
        }
        res.send({ msg: 'created successfully' });
    });
});
app.get('/question/getAll', function (req, res) {

    Question.find({}, null, { sort: { quesNum: 1 } }, function (err, questions) {
        if (err) {
            res.status(500).send();
        }
        res.send(questions).end();
    });
});

app.post('/question/answer', ensureAuthenticated, function (req, res) {

    Question.findOne({ "_id": req.body.questionId }, function (err, question) {
        if (err) {
            res.status(500).send();
        }
        Question.findOne({
            "_id": req.body.questionId,
            "users._id": req.user
        }, function (err, userQues) {
            if (err || userQues) {
                res.status(500).send({ "error": "You have already taken this question. Please wait for the next question." });
                return;
            }
            else {
                User.findOne({ "_id": req.user }, function (err, user) {
                    if (err) {

                        res.status(500).send({ "error": "error occured" });
                    }
                    var flag = 0;
                    if (req.body.answer === question.answer) {
                        flag = 1;
                        question.rusers.push(user);
                    }
                    if (req.body.answer != question.answer) {
                        question.wusers.push(user);
                    }
                    question.users.push(user);
                    question.save(function (err) {
                        if (!err) console.log('Success!');
                        var query = { '_id': req.user };
                        if (flag) {
                            User.findOneAndUpdate(query, { $inc: { quizScore: 5 } }, { "new": true }, function (err, doc) {
                                if (err) return res.send(500, { error: err });

                                for (var i = 0; i < connections.length; i++) {
                                    var tempItem = {};
                                    tempItem['email'] = doc.email;
                                    tempItem['flag'] = flag;
                                    tempItem['credits'] = doc.quizScore;
                                    connections[i].sseSend(tempItem)
                                }
                                res.json(tempItem).end();
                            });
                        }
                        else {

                            User.findOneAndUpdate(query, { $inc: { quizScore: -4 } }, { "new": true }, function (err, doc) {
                                if (err) return res.send(500, { error: err });

                                for (var i = 0; i < connections.length; i++) {
                                    var tempItem = {};
                                    tempItem['email'] = doc.email;
                                    tempItem['flag'] = flag;
                                    tempItem['credits'] = doc.quizScore;
                                    connections[i].sseSend(tempItem)
                                }
                                res.json(tempItem).end();
                            });

                        }


                    });
                });
            }
        });
    });
});


app.post('/question/result', function (req, res) {
    Question.findOne({ "_id": req.body.questionId }, '_id rusers wusers', function (err, question) {
        if (err) {
            res.status(500).send();
        }


        var userIds = [];
        var userIds2 = [];
        var total = 0;
        var rtotal = 0;
        var wtotal = 0;
        var tempArr = [];
        //var data = JSON.parse(question);
        question.rusers.forEach(item => {

            userIds.push(new mongoose.Types.ObjectId(item._id));
            rtotal++;
            /*             var tempItem = {};
                        tempItem['email'] = item.email;
                        tempItem['flag'] = 1;
                        tempItem['credits'] = item.credits;
                        tempArr.push(tempItem); */
        });
        question.wusers.forEach(item => {
            userIds2.push(new mongoose.Types.ObjectId(item._id));
            wtotal++;
            /*  var tempItem = {};
             tempItem['email'] = item.email;
             tempItem['flag'] = 0;
             tempItem['credits'] = item.credits;
             tempArr.push(tempItem); */
        });
        User.find({
            '_id': { $in: userIds }
        }, function (err, rusers) {
            if (err) {
                res.status(500).send();
            }
            else {
                rusers.forEach(item => {
                    var tempItem = {};
                    tempItem['email'] = item.email;
                    tempItem['flag'] = 1;
                    tempItem['credits'] = item.quizScore;
                    tempArr.push(tempItem);
                });
                User.find({
                    '_id': { $in: userIds2 }
                }, function (err, wusers) {
                    if (err) {
                        res.status(500).send();
                    }
                    else {
                        wusers.forEach(item => {
                            var tempItem = {};
                            tempItem['email'] = item.email;
                            tempItem['flag'] = 0;
                            tempItem['credits'] = item.quizScore;
                            tempArr.push(tempItem);
                        });
                        total = rtotal + wtotal;
                        res.send({ "data": tempArr, "total": total, "rtotal": rtotal, "wtotal": wtotal }).end();
                    }
                });
            }
        });

        console.log(question);
    });
})

app.get('/stream', function (req, res) {
    res.sseSetup()
    //res.sseSend("welcome")
    connections.push(res)
})



app.post('/upload/:challengeId', ensureAuthenticated, function (req, res) {
    Challenge.findOne({ "_id": req.params.challengeId }, function (err, challenge) {
        User.findOne({ "_id": req.user }, function (err, user) {
            Challenge.findOne({
                "_id": req.params.challengeId,
                "members._id": req.user
            }, function (err, userChal) {
                if (err || userChal) {
                    res.status(500).send({ "error": "You have already taken this challenge. Try another challenge." });
                    return;
                }
                else {
                    req.email = user.email;
                    upload(req, res, function (err) {
                        console.log(req.file);
                        if (err) {
                            res.json({ error_code: 1, err_desc: err });
                            return;
                        }
                        challenge.members.push(user);
                        challenge.save(function (err) {
                            if (!err) console.log('Success!');
                            res.json({ error_code: 0, err_desc: null });
                        });
                    })
                }

            })

        });

    });
});


app.get('/api/profile', ensureAuthenticated, function (req, res) {
    User.findById(req.user, function (err, user) {
        res.send(user);
    });
});
app.get('/api/profile/:id', ensureAuthenticated, function (req, res) {
    User.findById(req.params.id, function (err, user) {
        res.send(user);
    });
});
app.put('/api/profile/:id', ensureAuthenticated, function (req, res) {
    User.findByIdAndUpdate(req.params.id, req.body,{ new: true }, function (err, user) {
        if(err){
            return res.status(401).send({ message: 'Error Occured' });
        }
        res.send(user);
    });
});
/*
 |--------------------------------------------------------------------------
 | PUT /api/me
 |--------------------------------------------------------------------------
 */
app.post('/api/register', ensureAuthenticated, function (req, res) {

    Session.findById(req.body.sessionId, function (err, session) {
        if (!session) {
            return res.status(400).send({ message: 'Session not found' });
        }


        User.findOne({ "_id": req.user }, function (err, user) {
            Session.findOne({
                "_id": req.body.sessionId,
                "registrations._id": req.user
            }, function (err, userSession) {
                if (err || userSession) {
                    res.status(500).send({ "error": "You have already registered." });
                    return;
                }
                else {
                    session.registrations.push(user);
                    session.save(function (err) {
                        if (err) {
                            res.status(500).send({ "error": "failed" });
                        }
                        var Obj = { session: session._id, user: user._id }
                        QRCode.toDataURL(JSON.stringify(Obj), function (err, url) {
                            user.qrcode = url;
                            user.save(function (err) {
                                if (err) {
                                    res.status(500).send({ "error": "failed" });
                                }
                                res.status(200).send({ data: url });
                            })

                        })

                    });
                }

            })

        });

    });
});
app.post('/api/createSession', ensureAuthenticated, function (req, res) {
    var session = new Session({
        session: req.body.session,
        date: new Date(2018, 6, 30, 14, 0, 0, 0)
    });
    session.save(function (err, result) {
        if (err) {
            res.status(500).send({ message: err.message });
        }
        res.send({ message: "created successfully" });
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
        var activity = new Activity({
            description: 'Signed into Theme of the month portal',
            keyword: 'Login',
            userId: req.user,
            type: 'login'
        });
        user.comparePassword(req.body.password, function (err, isMatch) {
            if (!isMatch) {
                return res.status(401).send({ message: 'Invalid email and/or password' });
            }
            User.findOne({ _id: user }, 'name email', function (err, user) {
                if (err) {
                    res.status(500).send({ message: err.message });
                } else {
                    activity.userId = user.id;
                    activity.save(function (err, result) {
                        res.send({ token: createJWT(user), user: user });
                    });
                }
                
                
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
        var activity = new Activity({
            description: 'Registered to Theme of the month portal',
            keyword: 'Get started',
            userId: req.user,
            type: 'signup'
        });
        user.save(function (err, result) {
            if (err) {
                res.status(500).send({ message: err.message });
            } else {
                activity.userId = result.id;
                activity.save(function (err, act) {
                    res.send({ token: createJWT(result) });
                });
            }
            
            
        });
    });
});

app.post('/post/create', ensureAuthenticated, function (req, res) {

    var post = new Post({
        title: req.body.title,
        category: req.body.category,
        content: req.body.content,
        description: req.body.description,
        publisherId: req.user,
        createdOn: new Date()
    });
    var activity = new Activity({
        description: 'Created a new post '+post.title,
        keyword: 'Update on blockchain',
        userId: req.user,
        type: 'post'
    });
    post.save(function (err, result) {
        if (err) {
            res.status(500).send({ message: err.message });
        }
        var query = { '_id': req.user };
        User.findOneAndUpdate(query, { $inc: { credits: 5 } }, { upsert: true }, function (err, doc) {
            if (err) return res.send(500, { error: err });
            activity.save(function (err, result) {
                res.status(200).send({ msg: "success" });
            });
            
        });

    });
});
app.get('/useractivities/:id', ensureAuthenticated, function(req, res){
    
    Activity.find({userId: req.params.id}, '', { sort: { createdAt: -1 } })
    .populate('userId')
    .exec(function (err, activities) {
        if (err) {
            res.status(500).send({ message: err.message });
        }
        else
        res.status(200).send(activities);
    });
});
app.post('/article/create', ensureAuthenticated, function (req, res) {

    var article = new Article({
        title: req.body.title,
        category: req.body.category,
        description: req.body.description,
        link: req.body.link,
        publisherId: req.user,
        createdOn: new Date()
    });
    var activity = new Activity({
        description: 'Created a KM document '+req.body.title,
        keyword: 'KM doc',
        userId: req.user,
        type: 'kmDoc'
    });
    article.save(function (err, result) {
        if (err) {
            res.status(500).send({ message: err.message });
        }
        var query = { '_id': req.user };
        User.findOneAndUpdate(query, { $inc: { credits: 10 } }, { upsert: true }, function (err, doc) {
            if (err) return res.send(500, { error: err });
            activity.save(function (err, result) {
                res.status(200).send({ msg: "success" });
            });
            
        });
    });
});
app.post('/activities/create',function(req, res){
    var activity = new Activity({
        description: req.body.description,
        keyword: req.body.keyword,
        userId: req.user,
        type: req.body.type
    });
    activity.save(function (err, result) {
        res.status(200).send({ msg: "success" });
    });
});
app.post('/challenge/create', ensureAuthenticated, function (req, res) {

    var challenge = new Challenge({
        statement: req.body.statement,
        category: req.body.category,
        description: req.body.description,
        publisherId: req.user,
        createdOn: new Date()
    });
    challenge.save(function (err, result) {
        if (err) {
            res.status(500).send({ message: err.message });
        }
        var query = { '_id': req.user };
        User.findOneAndUpdate(query, { $inc: { credits: 20 } }, { upsert: true }, function (err, doc) {
            if (err) return res.send(500, { error: err });
            res.status(200).send({ msg: "success" });
        });
    });
});
app.get('/challenge/getAll', function (req, res) {

    Challenge.find({}, '_id statement category description publisherId createdOn members', { sort: { createdOn: -1 } }, function (err, challenges) {
        if (err) {
            res.status(500).send({ message: err.message });
        }
        var len = challenges.length;
        var resArr = [];
        var currIndex = 0;
        if (len > 0) {
            challenges.forEach(challenge => {

                User.findOne({ _id: challenge.publisherId }, 'name email', function (err, user) {
                    var tempObj = {};
                    tempObj = Object.assign(tempObj, challenge);
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

app.post('/feedback/create', ensureAuthenticated, function (req, res) {

    var feedback = new Feedback({
        name: req.body.name,
        email: req.body.email,
        feedback: req.body.feedback,
        publisherId: req.user,
        createdOn: new Date()
    });
    var activity = new Activity({
        description: 'Created a KM document',
        keyword: 'KM doc',
        userId: req.user,
        type: 'kmDoc'
    });
    feedback.save(function (err, result) {
        if (err) {
            res.status(500).send({ message: err.message });
        }
        activity.save(function (err, result) {
            res.status(200).send({ msg: "success" });
        });
        
        /*         let transporter = nodemailer.createTransport({
                    host: 'stbeehive.oracle.com',
                    port: 465,
                    secure: true, 
                    auth: {
                        user: 'no-reply@oracle.com', 
                        pass: ''
                    }
                });
            
                let mailOptions = {
                    from: '"Pradeep 👻" <pradeep.terli@oracle.com>',
                    to: 'pradeep.terli@oracle.com',
                    subject: 'Hello ✔',
                    text: 'Hello world?',
                    html: '<b>Hello world?</b>'
                }; */

        /*         transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        return console.log(error);
                    }
                    res.status(200).send({ msg: "success" });
            
                }); */
    });
});

app.get('/post/getAll', function (req, res) {

    Post.find({}, '_id title category content description publisherId createdOn', { sort: 'createdAt'})
    .populate('publisherId')
    .exec(function (err, posts) {
        if (err) {
            res.status(500).send({ message: err.message });
        }
        res.send(posts).end();

    });
});

app.get('/article/getAll', function (req, res) {

    Article.find({}, '_id title category description link publisherId createdOn', { sort: { createdOn: -1 } })
    .populate('publisherId')
    .exec(function (err, articles) {
        if (err) {
            res.status(500).send({ message: err.message });
        }
        res.status(200).send(articles).end();
    });
});

app.get('/user/getAll', function (req, res) {

    User.find({}, '_id name email credits quizScore', { sort: { quizScore: -1 } }, function (err, users) {
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
app.get('/reports/performance', (req, res) => {
    res.sendFile(path.join(__dirname, 'reports/10.177.153.50_2018-08-01_03-52-12.html'));
});
app.get('/sessions/js', (req, res) => {
    res.sendFile(path.join(__dirname, 'presentations/sessions/session1.html'));
});
app.get('/sessions/nodejs', (req, res) => {
    res.sendFile(path.join(__dirname, 'presentations/sessions/session2.html'));
});
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist/index.html'));
});


app.listen(app.get('port'), app.get('host'), function () {
    console.log('Express server listening on port 5000');
});
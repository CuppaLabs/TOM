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
var QRCode = require('qrcode')
var compression = require('compression');

var app = express();
app.use(compression());

app.set('port', process.env.PORT || 9999);
//app.set('host', process.env.NODE_IP || 'localhost');
app.use(cors());
//app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '/dist')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist/index.html'));
});


app.listen(5000, 'localhost', function () {
    console.log('Express server listening on port 5000');
});
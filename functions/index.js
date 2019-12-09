const functions = require('firebase-functions');
const firebase = require('firebase-admin');
const express = require('express');
const app = express();
const firebaseApp = firebase.initializeApp(functions.config().firebase);
app.set('view engine', 'pug');
app.use('/asset', express.static(__dirname + '/asset'));

app.get('/', function (req, res) {
    res.render('index', {title: "jogajog"});
});

app.post('/items', function (req, res) {
    return res.json(req.body)
});

exports.app = functions.https.onRequest(app);
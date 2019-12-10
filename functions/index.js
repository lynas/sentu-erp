const admin = require('firebase-admin');
const functions = require('firebase-functions');
const uuid = require('uuid');
admin.initializeApp(functions.config().firebase);
let db = admin.firestore();

const express = require('express');
const app = express();
app.set('view engine', 'pug');
app.use('/asset', express.static(__dirname + '/asset'));

app.get('/', function (req, res) {
    return res.render('index', {title: "jogajog"});
});

app.post('/items', function (req, response) {
    const id = '' + uuid.v1() + '';
    let data = {
        name: 'Los Angeles',
        state: 'CA',
        country: 'USA22'
    };
    /*    let setDoc = db.collection('shop-erp').doc(id).set(data);
        setDoc.then(res => {
            console.log(res);

        });*/
    db.collection('shop-erp').doc('d97d98f0-1b1d-11ea-9cc2-d765b666ba7c')
        .get()
        .then(result => {
            return response.json(result.data());
        });
});

exports.app = functions.https.onRequest(app);
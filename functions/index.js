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
    const productList = [];
    let productRef = db.collection('products');
    productRef.get()
        .then(snapshot => {
            snapshot.forEach(doc => {
                console.log(doc.id, '=>', doc.data());
                productList.push(doc.data());
            });
            // return res.json({title: "jogajog", productList: productList});
            return res.render('index', {title: "jogajog", productList: productList});
        })
        .catch(err => {
            console.log('Error getting documents', err);
            return res.render('index', {title: "jogajog"});
        });
});

app.post('/stocks', function (req, response) {
    const input = req.body;
    let setDoc = db.collection('products').doc(uuid.v1()).set(input);
    setDoc.then(res => {
        console.log(res);
        return response.json(input);
    });

});

app.get('/stocks/:productId', function (request, response) {
    const productId = request.params.productId;
    let productRef = db.collection('products').doc(productId);
    productRef.get()
        .then(snapshot => {
            // return response.json(snapshot.data());

            return response.render('stock-update', {
                title: "Stock Update",
                product: snapshot.data(),
                productId: productId
            });
        })
        .catch(err => {
            console.log('Error getting documents', err);
            return response.json({err: err});
        });
});


app.post('/stocks-update/:productId', function (request, response) {
    const productId = request.params.productId;
    const updatedProduct = request.body;
    let setDoc = db.collection('products').doc(productId).set(updatedProduct);
    setDoc.then(res => {
        console.log(res);
        // return response.json(updatedProduct);
        return response.redirect('/');
    });

});


exports.app = functions.https.onRequest(app);
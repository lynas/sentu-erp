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
            // return res.json({title: "Stock", productList: productList});
            return res.render('index', {title: "Stock-Home", productList: productList});
        })
        .catch(err => {
            console.log('Error getting documents', err);
            return res.render('index', {title: "Stock"});
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

app.get('/sales-order',  (request, response) => {
    const demoProduct = {
        id: "1",
        name: "name1",
        quantity: "20",
        unitPrice: "20"
    };
    const productList = [];
    let productRef = db.collection('products');
    productRef.get()
        .then(snapshot => {
            snapshot.forEach(doc => {
                console.log(doc.id, '=>', doc.data());
                productList.push(doc.data());
            });
            return response.render('sales-order', {
                title: "Sales Order",
                productList: productList
            });
        })
        .catch(err => {
            console.log('Error getting documents', err);
            return response.render('index', {title: "Stock"});
        });
/*    return response.render('sales-order', {
        title: "Sales Order",
        productList: productList
    });*/
});

app.post('/sales-order', (request, response) => {
    const input = request.body;
    console.log("sales-order-input");
    console.log(input);
    let setDoc = db.collection('sales-order').doc(uuid.v1()).set(input.salesOrderObj);

    input.productIdAndSoldQuantity.forEach(productLocal => {
        console.log("productLocal");
        console.log(productLocal);
        db.collection('products')
            .doc(productLocal.productId)
            .get()
            .then(productDb => {
                console.log("productDb");
                console.log(productDb);
                productDb.quantity = 99;
                db.collection('products')
                    .doc(productDb.id)
                    .update(productDb);
            })
            .catch(err => {
                console.log('Error getting documents', err);
            });

    });

















    setDoc.then(res => {
        console.log(res);
        return response.json(input);
    });
    // return response.json(input);
});


exports.app = functions.https.onRequest(app);
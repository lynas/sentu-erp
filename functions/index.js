const admin = require('firebase-admin');
const functions = require('firebase-functions');
const uuid = require('uuid');
admin.initializeApp(functions.config().firebase);
let db = admin.firestore();
let auth = admin.auth();

const express = require('express');
const app = express();
app.set('view engine', 'pug');
app.use('/asset', express.static(__dirname + '/asset'));

app.get('/login', function (request, response) {
/*    auth.createUser({
        email: 'sazzad@gmail.com',
        emailVerified: true,
        phoneNumber: '+11234567890',
        password: 'sazzad',
        displayName: 'Sazzad',
        photoURL: 'http://lynas.github.io/img/01.jpg',
        disabled: false
    }).catch(e=> console.log(e));*/
//https://firebase.google.com/docs/reference/admin/node/admin.auth.Auth
    const actionCodeSettings = {
        "continue-uri" : "https://stock-erpz.web.app/",
        "auth-continue-uri" : "https://stock-erpz.web.app/",
        "auth-continue-url" : "https://stock-erpz.web.app/",
        "url" : "https://stock-erpz.web.app/",
        handleCodeInApp: true
    };
    auth.generateSignInWithEmailLink('sazzad@gmail.com', actionCodeSettings)
        .then(function (link) {
            console.log("link");
            console.log(link);
            return response.json({link: link});
        })
        .catch(function (error) {
            console.log("error");
            console.log(error);
            return response.json({err: error});
        });
    // response.redirect('/')
});
app.get('/isLoggedIn', function (request, response) {
    const sessionCookie = request.cookies.session || '';
    // Verify the session cookie. In this case an additional check is added to detect
    // if the user's Firebase session was revoked, user deleted/disabled, etc.
    auth.verifySessionCookie(
        sessionCookie, true /** checkRevoked */)
        .then((decodedClaims) => {
            console.log("decodedClaims");
            console.log(decodedClaims);
            return response.json({decodedClaims: decodedClaims});
        })
        .catch(error => {
            return response.json({err: error});
        });
});
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
    input.id = uuid.v1();
    let setDoc = db.collection('products').doc(input.id).set(input);
    setDoc.then(res => {
        console.log(res);
        response.redirect('/')
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
        db.collection('products').doc(productLocal.productId)
        db.collection('products')
            .doc(productLocal.productId)
            .get()
            .then(productDb => {
                console.log("productDb");
                const productDbData = productDb.data();
                console.log(productDbData);
                productDbData.quantity = parseInt(productDbData.quantity) - parseInt(productLocal.soldQuantity);
                db.collection('products')
                    .doc(productDbData.id)
                    .update(productDbData);
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
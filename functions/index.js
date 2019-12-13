const admin = require('firebase-admin');
const functions = require('firebase-functions');
const uuid = require('uuid');
const session = require('express-session');


admin.initializeApp(functions.config().firebase);
let db = admin.firestore();

const express = require('express');
const app = express();


app.set('view engine', 'pug');
app.use('/asset', express.static(__dirname + '/asset'));
// TODO change in production
app.use(session({
    secret:'XASDASDA',
    name: '__session'
}));


app.get('/', function (request, response) {
    isUserLoggedIn(request, response);
    const productList = [];
    let productRef = db.collection('products');
    productRef.get()
        .then(snapshot => {
            snapshot.forEach(doc => {
                console.log(doc.id, '=>', doc.data());
                productList.push(doc.data());
            });
            // return response.json({title: "Stock", productList: productList});
            return response.render('index', {title: "Stock-Home", productList: productList});
        })
        .catch(err => {
            console.log('Error getting documents', err);
            return response.render('index', {title: "Stock"});
        });
});

app.post('/stocks', function (request, response) {
    isUserLoggedIn(request, response);
    const input = request.body;
    input.id = uuid.v1();
    let setDoc = db.collection('products').doc(input.id).set(input);
    setDoc.then(res => {
        console.log(res);
        response.redirect('/')
    });

});

app.get('/stocks/:productId', function (request, response) {
    isUserLoggedIn(request, response);
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
    isUserLoggedIn(request, response);
    const productId = request.params.productId;
    const updatedProduct = request.body;
    let setDoc = db.collection('products').doc(productId).set(updatedProduct);
    setDoc.then(res => {
        console.log(res);
        // return response.json(updatedProduct);
        return response.redirect('/');
    });

});

app.get('/sales-order', (request, response) => {
    isUserLoggedIn(request, response);
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
                today: today(),
                productList: productList
            });
        })
        .catch(err => {
            console.log('Error getting documents', err);
            return response.render('index', {title: "Stock"});
        });
});

app.post('/sales-order', (request, response) => {
    isUserLoggedIn(request, response);
    const input = request.body;
    console.log("sales-order-input");
    console.log(input);
    const salesOrderJson = {
        date: request.body.date,
        customerName: input.customerName,
        voucherNumber: input.voucherNumber,
        salesProductList: input.salesOrderObj,

    };
    let setDoc = db.collection('sales-order').doc(uuid.v1()).set(salesOrderJson);

    input.productIdAndSoldQuantity.forEach(productLocal => {
        console.log("productLocal");
        console.log(productLocal);
        db.collection('products').doc(productLocal.productId);
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
});

app.get('/login', (request, response) => {
    return response.render('login', {
        title: "User Login"
    });
});

app.post('/login', (request, response) => {
    const username = request.body.username;
    const password = request.body.password;
    console.log("username");
    console.log(username);
    // TODO Change in production
    if (username === 'sazzad' && password === '1234') {
        request.session.isLoggedIn = true;
        return response.redirect('/');
    }else{
        return response.render('error', {
            title: "User Login",
            message: "Username or password incorrect"
        });
    }
});

app.get('/logout', (request, response) => {
    request.session.isLoggedIn = false;
    return response.render('error', {
        title: "Logout",
        message: "You have been logged out successfully"
    });
});

function isUserLoggedIn(request, response) {
    console.log("request.session.isLoggedIn");
    console.log(request.session.isLoggedIn);
    console.log(request.session);
    if (!request.session.isLoggedIn) {
        response.redirect('/login');
    }
}

function today(){
    let today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    const year = today.getFullYear();

    today = day + '/' + month + '/' + year;
    return today
}


exports.app = functions.https.onRequest(app);
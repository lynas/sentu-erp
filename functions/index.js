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
    secret: 'XASDASDA',
    name: '__session'
}));
app.post('/login', (request, response) => {
    const username = request.body.username;
    const password = request.body.password;
    console.log("username");
    console.log(username);
    // TODO Change in production
    if (username === 'sazzad' && password === '1234') {
        request.session.isLoggedIn = true;
        return response.redirect('/');
    } else {
        return response.render('error', {
            title: "User Login",
            message: "Username or password incorrect"
        });
    }
});


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
            return response.render('index', {
                title: "Stock-Home",
                productList: productList,
                today: today()
            });
        })
        .catch(err => {
            console.log('Error getting documents', err);
            return response.render('index', {title: "Stock",productList:[],today: today()});
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
                productId: productId,
                today: today()
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
            return response.render('index', {
                title: "Stock",
                today: today()
            });
        });
});

app.get('/sales-order/:day', (request, response) => {
    isUserLoggedIn(request, response);
    const salesOfDayList = [];
    const day = request.params.day;
    let salesOfDay = db.collection('sales-order').where('date', '==', day);
    salesOfDay.get()
        .then(snapshot => {
            snapshot.forEach(doc => {
                console.log(doc.id, '=>', doc.data());
                salesOfDayList.push(doc.data());

            });

            salesOfDayList.forEach(so => {
                let salesOrderTotal = 0.0;
                const productList = [];
                for (const prop in so.salesProductList) {
                    productList.push({
                        id: so.salesProductList[prop].id,
                        quantity: so.salesProductList[prop].quantity,
                        unitPrice: so.salesProductList[prop].unitPrice,
                        subTotal: so.salesProductList[prop].subTotal,
                        freeQuantity: so.salesProductList[prop].freeQuantity,
                        itemName: so.salesProductList[prop].itemName
                    });
                    salesOrderTotal = salesOrderTotal + parseFloat(so.salesProductList[prop].subTotal)
                }
                so.productArray = productList;
                so.salesOrderTotal = salesOrderTotal;
            });


            // return response.json(salesOfDayList);
            return response.render('sales-order-of-a-day', {
                title: "Sales Order",
                salesOrderList: salesOfDayList,
                salesOrderDay: day,
                today: today()
            });
        })
        .catch(err => {
            console.log('Error getting documents', err);
            return response.json({err: err});
        });
});


app.get('/sales-order-delete/:salesOrderId', (request, response) => {
    isUserLoggedIn(request, response);
    const salesOfDayList = [];
    const salesOrderId = request.params.salesOrderId;
    let salesOrder = db.collection('sales-order').doc(salesOrderId);
    salesOrder.get()
        .then(snapshot => {
            salesOfDayList.push(snapshot.data());
            salesOfDayList.forEach(so => {
                for (const prop in so.salesProductList) {
                    const eachProduct = {
                        id: so.salesProductList[prop].id,
                        quantity: so.salesProductList[prop].quantity,
                        unitPrice: so.salesProductList[prop].unitPrice,
                        subTotal: so.salesProductList[prop].subTotal,
                        freeQuantity: so.salesProductList[prop].freeQuantity,
                        itemName: so.salesProductList[prop].itemName
                    };
                    console.log("Operate on product");
                    console.log(eachProduct.id);
                    console.log("revertAmount");
                    const revertAmount = parseInt(eachProduct.quantity) + parseInt(eachProduct.freeQuantity);
                    console.log(revertAmount);

                    db.collection('products')
                        .doc(eachProduct.id)
                        .get()
                        .then(snapshot => {
                            const product = snapshot.data();
                            console.log("Product Data Inner");
                            product.quantity = parseInt(product.quantity) + revertAmount;
                            db.collection('products')
                                .doc(product.id)
                                .set(product)
                                .then(res => {
                                    console.log("After Product quantity revert");
                                    console.log(res);
                                });
                        });
                }
            });
            db.collection("sales-order").doc(salesOrderId).delete().then(function () {
                console.log("Document successfully deleted!" + salesOrderId);
            }).catch(function (error) {
                console.error("Error removing document: ", error);
            });
            return response.redirect('/');
        })
        .catch(err => {
            console.log('Error processing documents', err);
            return response.json({err: err});
        });
});

app.post('/sales-order', (request, response) => {
    isUserLoggedIn(request, response);
    const input = request.body;
    console.log("sales-order-input");
    console.log(input);
    const salesOrderId = uuid.v1();
    const salesOrderJson = {
        date: request.body.date,
        customerName: input.customerName,
        voucherNumber: input.voucherNumber,
        salesProductList: input.salesOrderObj,
        id: salesOrderId

    };
    let setDoc = db.collection('sales-order').doc(salesOrderId).set(salesOrderJson);

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

function today() {
    let today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    const year = today.getFullYear();

    today = day + '-' + month + '-' + year;
    return today
}


exports.app = functions.https.onRequest(app);
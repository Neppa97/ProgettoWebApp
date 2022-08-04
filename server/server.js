const express=require('express');
const morgan = require('morgan');
const dao=require('./dao.js');
const jwt = require('express-jwt');
const jsonwebtoken = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
const { check, validationResult } = require('express-validator'); 
const jwtSecretContent = require('./secret.js');
const jwtSecret = jwtSecretContent.jwtSecret;

const app= express();
const port=3001;

app.use(morgan('tiny'));
app.use(express.json());

//errore lato DB
const dbErrorObj={errors: [{'param': 'Server', 'msg': 'Database error'}]};

const authErrorObj = { errors: [{ 'param': 'Server', 'msg': 'Authorization error' }] };
const expireTime = 300; //seconds

// Authentication endpoint
app.post('/api/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    dao.checkUserPass(username, password)
      .then((userObj) => {
        const token = jsonwebtoken.sign({ userID: userObj.userID }, jwtSecret, {expiresIn: expireTime});
        res.cookie('token', token, { httpOnly: true, sameSite: true, maxAge: 1000*expireTime });
        res.json(userObj);
      }).catch(
        // Delay response when wrong user/pass is sent to avoid fast guessing attempts
        (test) => new Promise((resolve) => {
          setTimeout(resolve, 1000)
        }).then(
             () => res.status(401).end()
        )
      );
  });
  
  
  
app.use(cookieParser());
  
const csrfProtection = csrf({
    cookie: { httpOnly: true, sameSite: true }
});

//logout: viene resettato il token
app.post('/api/logout', (req, res) => {
    res.clearCookie('token').end();
});

//GET /cars 
//deve essere usufruibile a priori dal token jwt
app.get('/api/cars',(req,res)=>{
  dao.getAllCars()
  .then((cars)=> res.json(cars) )
  .catch((err)=>res.status(503).json(dbErrorObj));
});

//da qui in poi tutte le API richiedono autenticazione
app.use(
    jwt({
      secret: jwtSecret,
      getToken: req => req.cookies.token
    })
);

//fornisce il token CSFR
app.get('/api/csrf-token', csrfProtection, (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
});

//gestione errore
app.use(function (err, req, res, next) {
    if (err.name === 'UnauthorizedError') {
      res.status(401).json(authErrorObj);
    }
});

//needed to know which is the user name when the user is already authenticated and
//somebody reloaded the page with the browser
app.get('/api/user', (req, res) => {
    const userID = req.user && req.user.userID;
    dao.loadUserInfo(userID)   
    .then((userObj) => {
      res.json(userObj);
    }).catch((err) => res.status(503).json(dbErrorObj));
});
  

//REST API endpoints

//GET /rentals/<params>
app.get('/api/rentals/:category/:kmd/:eta/:guidAdd/:ass/:dataI/:dataF',(req,res)=>{
    const userID = req.user && req.user.userID;
    dao.checkAvbPrice(req.params.category,req.params.kmd,req.params.eta,req.params.guidAdd,req.params.ass,req.params.dataI,req.params.dataF,userID)
    .then((v)=> res.json({nA: v[0],price: v[1],carID: v[2]}) )
    .catch((err)=>res.status(503).json(dbErrorObj));
});

//POST /payment
app.post('/api/payment', [
  check('price').not().isEmpty(),
  check('fullName').not().isEmpty(),
  check('cardNumber').not().isEmpty(),
  check('CVV').not().isEmpty(),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({errors: errors.array()});
  }
  res.end();
});

//POST /rentals/add
app.post('/api/rentals/add', csrfProtection, [
  check('carID').not().isEmpty(),
  check('dataI').not().isEmpty(),
  check('dataF').not().isEmpty(),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  const userID = req.user && req.user.userID;
  dao.insertRental({
    carID: req.body.carID,
    dataI: req.body.dataI,
    dataF: req.body.dataF
  }, userID).then((result) => res.end())
    .catch((err) => res.status(503).json(dbErrorObj));
});

//GET /rentals
app.get('/api/rentals',(req,res)=>{
  const userID = req.user && req.user.userID;
  dao.getRentals(userID)
  .then((rentals)=> res.json(rentals) )
  .catch((err)=>res.status(503).json(dbErrorObj));
});

//DELETE /rentals/<rentalID>
app.delete('/api/rentals/:rentalID', csrfProtection, (req, res) => {
  const userID = req.user && req.user.userID;
  dao.deleteRental(req.params.rentalID, userID)
    .then((result) => res.end())
    .catch((err) => res.status(503).json(dbErrorObj));
});

//attivazione server
app.listen(port, ()=> console.log(`Gestore autonoleggio in ascolto a http://localhost:${port}`));
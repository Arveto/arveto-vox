//***Initialization***

    //Modules
    //Server modules
var express = require('express'),
    app = express(),
    server = require('http').createServer(app);

var constructors = require('./constructors.js');

    //DB Connection
var mysql = require('mysql');
var config = {
    host     : 'localhost',
    user     : 'root',
    password : 'root',
    database : 'arvetovox'
};

var database = new constructors.Database(mysql, config);


    //Other
var path = require('path'),
cookieParser = require('cookie-parser');
bodyParser = require('body-parser'),
hasher = require ('node-hasher');

    //User parser for client side data
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

    //Serving public folder
app.use('/public', express.static(__dirname + '/public'));

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');





//***Routes***

    //Testing page
app.get('/', (req, res) => {
    console.log("Fetching home page");
    database.query('SELECT name, id FROM categories')
    .then( rows => {
        console.log("About to render page");
        //Fetches a list of all categories
        res.render('home.ejs', {categories: rows});
    });
})

.get('/signup', (req, res) => {
   res.sendFile(path.join(__dirname+'/signup.html'));
})

.get('/login', (req, res) => {
   res.sendFile(path.join(__dirname+'/login.html'));
})

.get('/write', (req, res) => {
    if(req.cookies.password == undefined){
        res.redirect('/');
    }
    else {
        database.query('SELECT name, id FROM categories')
        .then( rows => {
            //Fetches a list of all categories
            res.render('write.ejs', {categories: rows});
        });

    }

})

app.get('/category/:category', (req, res) => {
    var category;

    database.query('SELECT * FROM categories WHERE id = ?', req.params.category)
    .then(rows => {
        //Get category data from DB
        category = rows[0];

        return database.query('SELECT * FROM articles WHERE category_id = ?', req.params.category);
    })
    .then(rows => {
        //Get all articles and rendering page
        res.render('category.ejs', {category: category, articles: rows});
    });
});



//***Forms***

app.post('/signup', (req, res) => {
    let password = hasher('sha512', req.body.password);

    //Query
    database.query('INSERT INTO users (username, password) VALUES(?, ?)', [req.body.pseudo, password])
    .then( rows => {

        //Set cookies
        if(req.body.stayConnected == 'on'){
            res.cookie('pseudo', req.body.pseudo, { httpOnly: false, maxAge: 900000000 });
            res.cookie('password', password, { httpOnly: false, maxAge: 900000000 });
        }
        else{
            res.cookie('pseudo', req.body.pseudo, { httpOnly: false });
            res.cookie('password', password, { httpOnly: false });
        }

        res.redirect('/');

    });
});


app.post('/login', (req, res) => {
    let password = hasher('sha512', req.body.password);

    //Query
    let query = 'SELECT id FROM users WHERE (username = ?) AND (password = ?)';
    console.log("Launching login query");
    database.query(query, [req.body.pseudo, password])
    .then( rows => {

        console.log(rows);

        if (rows.length > 0){

            //Set cookies
            if(req.body.stayConnected == 'on'){
                res.cookie('pseudo', req.body.pseudo, { httpOnly: false, maxAge: 90000000000 });
                res.cookie('password', password, { httpOnly: false, maxAge: 90000000000 });
            }
            else{
                res.cookie('pseudo', req.body.pseudo, { httpOnly: false });
                res.cookie('password', password, { httpOnly: false });
            }

            res.redirect('/');
        }

        else{
            res.redirect('/login');
        }
    });
});


server.listen(8080);

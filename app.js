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
var io = require('socket.io').listen(server),
path = require('path'),
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
    database.query('SELECT name, id FROM categories')
    .then( rows => {
        //Fetches a list of all categories
        res.render('test.ejs', {categories: rows});
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
        res.sendFile(path.join(__dirname+'/write.html'));
    }

})

app.get('/category/:category', (req, res) => {
    database.query('SELECT * FROM categories WHERE id=?', req.params.category)
    .then( rows => {
        res.render('category.ejs', {category: rows[0]});
    });
});



//***Forms***

app.post('/signup', (req, res) => {
    let password = hasher('sha512', req.body.password);

    //Query
    database.query('INSERT INTO users (username, password) VALUES(?, ?)', [req.body.pseudo, password])
    .then( rows => {
        if (error) throw error;
        else{
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
        }
    });
});


app.post('/login', (req, res) => {
    let password = hasher('sha512', req.body.password);

    //Query
    let query = 'SELECT id FROM users WHERE (username = ?) AND (password = ?)';
    database.query(query, [req.body.pseudo, password])
    .then( rows => {
        if (error) throw error;
        else if (results[0].id != undefined){

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
    });
});


server.listen(8080);

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

//Home
app.get('/', (req, res) => {
    database.query('SELECT name, id FROM categories')
    .then( rows => {
        //Fetches a list of all categories
        res.render('home.ejs', {categories: rows});
    });
})

//Signup
.get('/signup', (req, res) => {
   res.sendFile(path.join(__dirname+'/signup.html'));
})

//Login
.get('/login', (req, res) => {
   res.sendFile(path.join(__dirname+'/login.html'));
})

//To publish an article
.get('/write/:category', (req, res) => {
    if(req.cookies.password == undefined){
        res.redirect('/');
    }
    else {
        database.query('SELECT name, id FROM categories')
        .then( rows => {
            //Fetches a list of all categories, with the id of the one we want to publish in
            res.render('write.ejs', {categories: rows, current: req.params.category});
        });

    }

})

//To browse a category
app.get('/category/:category', (req, res) => {
    var category;

    database.query('SELECT * FROM categories', req.params.category)
    .then(rows => {
        //Get category data from DB
        categories = rows;
        //TODO Fix that f* request
        let query ='SELECT u.pseudo, a.* FROM articles a INNER JOIN u users ON a.author_id = u.id WHERE a.category = ? ORDER BY date DESC';

        return database.query(query, rows[req.params.category].id);
    })
    .then(rows => {
        //Get all articles and rendering page
        res.render('category.ejs', {categories: categories, articles: rows, current: req.params.category});
    });
});



//***Forms***

//Signup
app.post('/signup', (req, res) => {
    let password = hasher('sha512', req.body.password);

    //Query
    database.query('INSERT INTO users (username, password) VALUES(?, ?)', [req.body.pseudo, password])
    .then( rows => {

        //Set cookies (expiration date changes)
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


//Login
app.post('/login', (req, res) => {
    let password = hasher('sha512', req.body.password);

    //Query
    let query = 'SELECT id FROM users WHERE (username = ?) AND (password = ?)';
    database.query(query, [req.body.pseudo, password])
    .then( rows => {

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


//Publish an article
app.post('/write/:category', (req, res) => {
    console.log("Les problèmes commencent =)");
    console.log("authorPseudo="+req.body.authorPseudo);
    console.log("authorPassword="+req.body.authorPass);

    //We verify that the user exists, and get its ID
    let query = 'SELECT id FROM users WHERE (username = ?) AND (password = ?)';
    database.query(query, [req.body.authorPseudo, req.body.authorPass])
    .then(rows => {
        console.log("Résultat 1= "+rows);
        if(rows.length == 0){
            return
        }

        var authorId = rows[0].id;
        console.log("Id du gars= "+authorId);
        var numCat = parseInt(req.body.category);

        let query = 'INSERT INTO articles (title, author_id, content, category_id) VALUES (?, ?, ?, ?)';
        return database.query(query, [req.body.title, authorId, req.body.text, numCat]);
    })
    .then(rows =>{
        console.log('Terminé');
        res.redirect('/');
    });
});


server.listen(8080);

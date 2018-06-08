//***Initialization***

    //Modules
    //Server modules
var express = require('express'),
    app = express(),
    server = require('http').createServer(app);

var constructors = require('./constructors.js');

    //DB Connection
//Fuck security, this is an open source website :p
var mysql = require('mysql');
var config = {
    host     : 'lt80glfe2gj8p5n2.chr7pe7iynqr.eu-west-1.rds.amazonaws.com',
    user     : 'kvynzd2vesxy2k3u',
    password : 'ff6kr5tq5oqn503c ',
    database : 'dbdscf07r64azis6'
};

var database = new constructors.Database(mysql, config);

var markdown = require( "markdown" ).markdown;


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
    var categories;
    database.query('SELECT name, id FROM categories ORDER BY id ASC')
    .then( rows => {
        //Fetches a list of all categories
        categories = rows;

        return database.query('SELECT users.username, articles.* FROM users INNER JOIN articles ON users.id = articles.author_id ORDER BY date DESC;');
    })
    .then( rows => {
        res.render('home.ejs', {categories: categories, articles: rows});
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
        database.query('SELECT name, id FROM categories ORDER BY id ASC')
        .then( rows => {
            //Fetches a list of all categories, with the id of the one we want to publish in


            let current = {};
            for(let i=0; i< rows.length; i++){
                if(req.params.category == rows[i].id){
                    current = rows[i];
                    break;
                }
            }


            res.render('write.ejs', {categories: rows, current: current});
        });
    }
})

//To browse a category
.get('/category/:category', (req, res) => {
    var categories;

    database.query('SELECT * FROM categories ORDER BY id ASC')
    .then(rows => {
        //Get category data from DB
        categories = rows;


        let query ='SELECT users.username, articles.* FROM users INNER JOIN articles ON users.id = articles.author_id WHERE articles.category_id = ? ORDER BY date DESC;';
        return database.query(query, req.params.category);
    })
    .then(rows => {
        //Get all articles and rendering page
        let current = {};
        for(let i=0; i< categories.length; i++){
            if(req.params.category == categories[i].id){
                current = categories[i];
                break;
            }
        }

        res.render('category.ejs', {categories: categories, articles: rows, current: current});
    });
})

//To read an article
.get('/article/:id', (req, res) => {

    var article = {};
    var comments = {};

    //let query = 'SELECT * FROM articles WHERE id = ?;';
    let query = 'SELECT users.username, articles.* FROM users INNER JOIN articles ON users.id = articles.author_id WHERE articles.id = ?';

    database.query(query, req.params.id)
    .then(rows => {

        article = rows[0];

        let query ='SELECT users.username, comments.* FROM users INNER JOIN comments ON users.id = comments.author_id WHERE comments.article_id = ? ORDER BY date DESC;';

        return database.query(query, article.id);
    })
    .then(rows => {
        comments = rows;
        return database.query('SELECT * FROM categories ORDER BY id ASC');
    })
    .then(rows => {
        res.render('article.ejs', {categories: rows, current: article.category_id, article: article, comments: comments});
    });
})

//Error 404 (keep as last route)
.get('*', function(req, res){
  res.sendFile(path.join(__dirname+'/404.html'));
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
})


//Login
.post('/login', (req, res) => {
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
})


//Publish an article
.post('/write/:category', (req, res) => {

    var text = markdown.toHTML(req.body.text);

    //We verify that the user exists, and get its ID
    let query = 'SELECT id FROM users WHERE (username = ?) AND (password = ?)';
    database.query(query, [req.body.authorPseudo, req.body.authorPass])
    .then(rows => {
        if(rows.length == 0){
            return
        }

        var authorId = rows[0].id;
        var numCat = parseInt(req.body.category);

        let query = 'INSERT INTO articles (title, author_id, content, category_id) VALUES (?, ?, ?, ?)';
        return database.query(query, [req.body.title, authorId, text, numCat]);
    })
    .then(rows =>{
        res.redirect('/');
    });
})


//Vote an article
.post('/vote', (req, res) => {
    let query;
    if(req.body.voteType != undefined){
        query = 'UPDATE articles SET karma=karma+1 WHERE id=?';
    }
    else{
        query = 'UPDATE articles SET karma=karma-1 WHERE id=?';
    }

    console.log('query = '+query);

    database.query(query, [req.body.id], () => {
        res.redirect("/article/"+req.body.id);
    });
})


//Comment an article
.post('/article/:id', (req, res) => {

    //We verify that the user exists, and get its ID
    let query = 'SELECT id FROM users WHERE (username = ?) AND (password = ?)';
    database.query(query, [req.body.authorPseudo, req.body.authorPass])
    .then(rows => {
        if(rows.length == 0){
            return
        }

        var authorId = rows[0].id;
        var numId = parseInt(req.body.articleId);

        let query = 'INSERT INTO comments (article_id, author_id, content) VALUES (?, ?, ?)';
        return database.query(query, [numId, authorId, req.body.commentText])
    })
    .then(rows => {
        res.redirect('..');
    });
});

server.listen(8080);

//***Initialization***

    //Modules
    //Server modules
var express = require('express'),
    app = express(),
    server = require('http').createServer(app);

    //DB Connection
var mysql = require('mysql');
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'root',
    database : 'arvetovox'
});
connection.connect();

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



//***Routes***

    //Testing page
app.get('/', function(req, res){
   res.sendFile(path.join(__dirname+'/test.html'));
});

app.get('/signup', function(req, res){
   res.sendFile(path.join(__dirname+'/signup.html'));
});

app.get('/login', function(req, res){
   res.sendFile(path.join(__dirname+'/login.html'));
});


//Get session system forms
app.post('/signup', function(req, res){
    let password = hasher('sha512', req.body.password);

    //Query
    connection.query('INSERT INTO users (username, password) VALUES(?, ?)', [req.body.pseudo, password], function (error, results, fields) {
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


app.post('/login', function(req, res){
    let password = hasher('sha512', req.body.password);

    //Query
    let query = 'SELECT id FROM users WHERE (username = ?) AND (password = ?)';
    connection.query(query, [req.body.pseudo, password], function (error, results, fields) {
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

const express = require('express');
const app = express();
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require("cors");

var corsOptions = {
  origin: 'https://smart-shoes.netlify.app',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

app.use(cors(corsOptions));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

var connection = mysql.createConnection({
    host: process.env['HOST'],
    user: process.env['USER'],
    password: process.env['PASSWORD'],
    database: process.env['DB']
});


connection.connect(function (err) {
    if (err) throw err
    console.log('You are now connected...')
})

app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));

app.get('/', function(req, res){
  res.end(JSON.stringify({'active': true}))
})
//rest api to get all results
app.get('/users', function (req, res) {
    connection.query('SELECT * FROM users', function (error, results, fields) {
        if (error) throw error;
        res.end(JSON.stringify(results));
    });
});

app.get('/users/search/:name', function(req, res){
    connection.query('SELECT * FROM users WHERE name LIKE ?', ['%' + req.params.name + '%'], function (error, results, fields) {
        if (error) throw error;
        // const result = (results.length > 0) ? results[0].name : [];
        let search_res = [];
        for(let i  = 0; i < results.length; i++){
          search_res.push(results[i].name)
        }
        res.end(JSON.stringify(search_res));
    });
})

app.post('/users/signup', function (req, res) {
    const postData = req.body;
    connection.query('INSERT INTO users SET ?', postData, function (error, results, fields) {
        if (error) throw error;
        res.end(JSON.stringify(results));
    });
});

app.post('/users/delete', function (req, res) {
    const {id, password }= req.body;

    connection.query('DELETE FROM users WHERE id=? AND password=?', [id, password], (error, results) => {
        if (error) {
            throw error
        }
        res.end(JSON.stringify(results));
    })
})

app.post('/users/updateName', function (req, res){
    const {id, name} = req.body;

    connection.query(
        'UPDATE users SET name = ? WHERE id = ?',
        [name, id],
        (error, results) => {
            if (error) {
                throw error
            }
            res.end(JSON.stringify(results));
        }
    )
})

app.post('/users/updatePassword', function (req, res) {
    const { id, oldPassword, newPassword } = req.body;

    connection.query(
        'UPDATE users SET password = ? WHERE id = ? AND password = ?',
        [newPassword, id, oldPassword],
        (error, results) => {
            if (error) {
                throw error
            }
            res.end(JSON.stringify(results));
        }
    )
})

app.post('/users/login', function (req, res) {
    const { email, password } = req.body;

    connection.query(
        'SELECT * FROM users WHERE email = ? AND password = ?',
        [email, password],
        (error, results) => {
            if (error) {
                throw error
            }
            res.end(JSON.stringify(results));
        }
    )
})

app.post('/users/updateInfo', function (req, res){
    const { id, password, info, which} = req.body;
    
      connection.query(
        `UPDATE users SET ${which} = ? WHERE id = ? AND password = ?`,
        [info, id, password],
        (error, results) => {
            if (error) {
                throw error
            }
            res.end(JSON.stringify(results));
        }
    )
})

app.post('/users/updateLocation', function (req, res){
  const { id, location } = req.body;

  connection.query(
    `UPDATE users SET location = ? WHERE id = ?`,
    [location, id],
    (error, results) => {
      if(error){
        throw error
      }
      res.end(JSON.stringify(results))
    } 
  )
})

app.post('/users/setLast', function (req, res){
  const {id, last} = req.body;
  connection.query(
    `UPDATE users SET last = ? WHERE id = ?`,
    [last, id],
    (error, results) => {
      if(error){
        throw error
      }
      res.end(JSON.stringify(results));
    }
  )
})

app.post('/users/getLast', function (req, res){
  const {name} = req.body;

  connection.query(
    `SELECT * FROM users WHERE name = ?`,
    [name],
    (error, results) => {
      if(error){
        throw error
      }
      res.end(JSON.stringify(results[0].last));
    }
  )
})

app.post('/users/getFriends', function (req, res){
  const {name} = req.body;

  connection.query(
    `SELECT * FROM users WHERE name = ?`,
    [name],
    (error, results) => {
      if(error){
        throw error
      }
      res.end(JSON.stringify(results[0].friends));
    }
  )
})

app.get('/users/check/:email', function (req, res){
  connection.query(
    `SELECT email FROM users WHERE email = ?`,
    [req.params.email],
    (error, results) => {
      if(error){
        throw error
      }
      res.end(JSON.stringify(results));
    }
  )
})

app.post('/users/getLocation', function(req, res){
  const {name} = req.body;

  connection.query(
    'SELECT * FROM users WHERE name = ?',
    [name],
    (error, results) => {
      if(error){
        throw error
      }
      res.end(JSON.stringify(results[0].location));
    }
  )
})

app.listen(3000, function () {
    console.log("Server running succesfully!");
});
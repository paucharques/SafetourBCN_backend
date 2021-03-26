const express = require('express');
const bodyParser = require('body-parser');
const pool = require('./db')
var jwt = require('jsonwebtoken');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


app.get('/api', (req, res) => res.send('Its working!'));

app.get('/users', async (req, res) => {
    let conn;
    try {
        // establish a connection to MariaDB
        conn = await pool.getConnection();

        // create a new query
        var query = "select * from USERS";

        // execute the query and set the result to a new variable
        var rows = await conn.query(query);

        // return the results
        res.send(rows);
    } catch (err) {
        throw err;
    } finally {
        if (conn) return conn.release();
    }
});


app.get('/users/:email', async (req, res) => {
    let conn;
    try {
        // establish a connection to MariaDB
        conn = await pool.getConnection();

        // execute the query and set the result to a new variable
        var rows = await conn.query("select * from USERS where EMAIL = ?", [req.params.email]);
        // return the results
        res.send(rows);
    } catch (err) {
        throw err;
    } finally {
        if (conn) return conn.release();
    }
});

// LOGIN
app.get('/login', async (req, res) => {
    let conn;
    try{
        conn = await pool.getConnection();

        var email = req.body.email;
        var password = req.body.password;
    
        //S'hauria de comprovar que no existeix el username i assginar l'id automaticament
        conn.query('SELECT * FROM USERS WHERE EMAIL = ? AND PASSWORD = ?;', [email, password])
            .then((result) => {
                var token = jwt.sign({username: email}, 'supersecret');
                res.send(token)
            })
            .catch(err => {
                throw err
            });
    }catch(err){
        throw err;
    } finally {
        if (conn) return conn.release();
    }

});



/**********************POST***********************/

// Add a new user
app.post('/registerIndividualUser', async (req, res) => {
    let conn;
    try{
        conn = await pool.getConnection();
        conn.query('INSERT INTO USERS VALUES(?,?,?);', [req.body.email, req.body.username, req.body.password])
        .then((result) => {
            conn.query('INSERT INTO INDIVIDUAL_USER VALUES(?,?);', [req.body.email, null])
                .then((result) => {
                    res.status(201).send('user added');
                })
                .catch(err => {
                    throw err
                });
        })
        .catch(err => {
            throw err
        });
    } catch(err){
        throw err;
    } finally {
        if (conn) return conn.release();
    }
});

// Add a company
app.post('/registerCompany', async (req, res) => {
    let conn;
    try{
        conn = await pool.getConnection();
        conn.query('INSERT INTO USERS VALUES(?,?,?);', [req.body.email, req.body.username, req.body.password])
        .then((result) => {
            conn.query('INSERT INTO COMPANIES VALUES(?,?);', [req.body.email, req.body.description])
                .then((result) => {
                    res.status(201).send('company added');
                })
                .catch(err => {
                    throw err
                });
        })
        .catch(err => {
            throw err
        });
    } catch(err){
        throw err;
    } finally {
        if (conn) return conn.release();
    }
});


/**********************PUT***********************/

// Update an existing user
app.put('/usuarios/:id', (request, response) => {
    const id = request.params.id;
 
    pool.query('UPDATE users SET ? WHERE id = ?', [request.body, id], (error, result) => {
        if (error) throw error;
 
        response.send('User updated successfully.');
    });
});


/**********************DELETE***********************/


// Delete a user
app.delete('/usuarios/:email', async (req, res) => {
    let conn;
        try{

        var rows = await conn.query('SELECT * FROM INDIVIDUAL_USERS WHERE email = ?', [email, password]);
            if(rows && rows.length)
            conn = await pool.getConnection();
            conn.query('DELETE FROM USERS WHERE email = ?', [req.params.email])
            .then((result) => {
                if(!(rows && rows.length)) conn.query('DELETE FROM COMPANIES WHERE email = ?', [req.params.email])
                    .then((result) => {
                        if(rows && rows.length) conn.query('DELETE FROM INDIVIDUAL_USERS WHERE email = ?', [req.params.email])
                            .then((result) => {
                               res.status(201).send('User deleted');
                            }).catch(err => {
                                   throw err
                              });
                    })
                    .catch(err => {
                        throw err
                    });
            })
            .catch(err => {
                throw err
            });
        } catch(err){
            throw err;
        } finally {
            if (conn) return conn.release();
        }
});

app.listen(3000, function(){
    console.log('now listening for requests');
 });




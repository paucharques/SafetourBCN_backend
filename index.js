const express = require('express');
const bodyParser = require('body-parser');
const pool = require('./db')

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


app.get('/api', (req, res) => res.send('Its working!'));

app.get('/usuarios', async (req, res) => {
    let conn;
    try {
        // establish a connection to MariaDB
        conn = await pool.getConnection();

        // create a new query
        var query = "select * from USUARIOS";

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


// Display a single user by ID
app.get('/usuarios/:id', async (req, res) => {
    let conn;
    try {
        // establish a connection to MariaDB
        conn = await pool.getConnection();

        const id = req.params.id;

        // create a new query
        var query = ("SELECT * FROM usuarios WHERE ID_USUARIO = ?", [id]);

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


/**********************POST***********************/

// Add a new user
app.post('/register/', async (request, response) => {
    try{
        var post_data = request.body;
        var id = post_data.id;
        var username = post_data.username;
        var password = post_data.password;

        conn = await pool.getConnection();
    
        //S'hauria de comprovar que no existeix el username i assginar l'id automaticament

        conn.query('INSERT INTO USUARIOS VALUES(?,?,?);', [id, username, password], (error, result) => {
            if (error) throw error;
        
            response.status(201).send(`User added with ID: ${result.insertId}`);
        });
    }catch(err){
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
app.delete('/usuarios/:id', (request, response) => {
    const id = request.params.id;
 
    pool.query('DELETE FROM users WHERE id = ?', id, (error, result) => {
        if (error) throw error;
 
        response.send('User deleted.');
    });
});

app.listen(3000, function(){
    console.log('now listening for requests');
 });
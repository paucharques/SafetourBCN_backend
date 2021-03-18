const express = require('express');
const pool = require('./db')

const app = express();


app.get('/api', (req, res) => res.send('Its working!'));

app.get('/people', async (req, res) => {
    let conn;
    try {
        // establish a connection to MariaDB
        conn = await pool.getConnection();

        // create a new query
        var query = "SELECT * FROM USUARIOS";

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



app.listen(process.env.port || 3000, function(){
    console.log('now listening for requests');
 });

 /** 

 Display a single user by ID
app.get('/users/:id', (request, response) => {
    const id = request.params.id;
 
    pool.query('SELECT * FROM usuarios WHERE id = ?', id, (error, result) => {
        if (error) throw error;
 
        response.send(result);
    });
});


/**********************POST***********************

// Add a new user
app.post('/users', (request, response) => {
    pool.query('INSERT INTO usuario SET ?', request.body, (error, result) => {
        if (error) throw error;
 
        response.status(201).send(`User added with ID: ${result.insertId}`);
    });
});


/**********************PUT***********************

// Update an existing user
app.put('/users/:id', (request, response) => {
    const id = request.params.id;
 
    pool.query('UPDATE users SET ? WHERE id = ?', [request.body, id], (error, result) => {
        if (error) throw error;
 
        response.send('User updated successfully.');
    });
});


/**********************DELETE***********************


// Delete a user
app.delete('/users/:id', (request, response) => {
    const id = request.params.id;
 
    pool.query('DELETE FROM users WHERE id = ?', id, (error, result) => {
        if (error) throw error;
 
        response.send('User deleted.');
    });
});

*/
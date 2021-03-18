const express = require('express');
const mariadb = require('mariadb');

//module.exports = router;

// set up our express app
const app = express();

app.get('/api', (req, res) => res.send('Its working!'));

app.listen(process.env.port || 3000, function(){
    console.log('now listening for requests');
 });

/**
// connect to mariadb
const mariadb = require('mariadb');
const pool = mariadb.createPool({
    host: 'mydb.com', 
    user:'myUser', 
    password: 'myPassword',
    connectionLimit: 5
});

/**********************GET***********************

app.get('/users', (request, response) => {
    pool.query('SELECT * FROM usuarios', (error, result) => {
        if (error) throw error;
 
        response.send(result);
    });
});

// Display a single user by ID
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
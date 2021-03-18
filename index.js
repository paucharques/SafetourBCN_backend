const express = require('express');
const pool = require('./db')

const app = express();


app.get('/api', (req, res) => res.send('Its working!'));

app.get('/usuarios', async (req, res) => {
    pool.getConnection()
    .then(conn => {
    
      conn.query("SELECT 1 as val")
        .then((rows) => {
          console.log(rows); //[ {val: 1}, meta: ... ]
          //Table must have been created before 
          // " CREATE TABLE myTable (id int, val varchar(255)) "
          return conn.query("INSERT INTO usuarios value (?, ?)", [1, "mariadb"]);
        })
        .then((res) => {
          console.log(res); // { affectedRows: 1, insertId: 1, warningStatus: 0 }
          conn.end();
        })
        .catch(err => {
          //handle error
          console.log(err); 
          conn.end();
        })
        
    }).catch(err => {
      //not connected
    });
});



app.listen(3000, function(){
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
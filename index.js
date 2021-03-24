const express = require('express');
const bodyParser = require('body-parser');
const pool = require('./db')

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


app.get('/users/:id', async (req, res) => {
    let conn;
    try {
        // establish a connection to MariaDB
        conn = await pool.getConnection();

        const id = req.params.id;
        console.log(id)

        // execute the query and set the result to a new variable
        var rows = await conn.query("select * from USUARIOS where ID_USUARIO = ?", [id]);

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
<<<<<<< HEAD
app.post('/register', async (request, response) => {
=======
app.post('/register_individual_user', async (req, res) => {
    let conn;
    try{
        conn = await pool.getConnection();
        let id
        conn.query('SELECT COUNT(*) FROM USUARIOS')
        .then((result) =>{
            id = result[0]['COUNT(*)']
            id++
            conn.query('INSERT INTO USUARIOS VALUES(?,?,?);', [id, req.body.username, req.body.password])
            .then((result) => {
                conn.query('INSERT INTO USUARIOS_INDIVIDUALES VALUES(?,?);', [id, req.body.location])
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
        })
        .catch(err =>{
            console.log(err)
        })

    }catch(err){
        throw err;
    } finally {
        if (conn) return conn.release();
    }

});

// Add a business
app.post('/register_buisness', async (req, res) => {
>>>>>>> 09ba6aa789154972c30bda7eac419cb18f51a4b4
    let conn;
    try{
        conn = await pool.getConnection();

        var post_data = request.body;
        var id = post_data.id;
        var username = post_data.username;
        var password = post_data.password;
    
        //S'hauria de comprovar que no existeix el username i assginar l'id automaticament
        conn.query('INSERT INTO USUARIOS VALUES(?,?,?);', [id, username, password], (error, result) => {
            if (error) throw error;
            
            res.status(201).send('user added');
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
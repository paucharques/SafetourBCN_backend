const express = require("express");
const bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
const pool = require("./db");
var jwt = require("jsonwebtoken");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

app.get("/api", (req, res) => res.send("Its working!"));

app.get("/users", async (req, res) => {
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

//GET user
app.get("/users/:email", async (req, res) => {
  let conn;
  try {
    // establish a connection to MariaDB
    conn = await pool.getConnection();

    // execute the query and set the result to a new variable
    var rows = await conn.query("select * from USERS where EMAIL = ?", [
      req.params.email,
    ]);
    // return the results
    res.send(rows);
  } catch (err) {
    throw err;
  } finally {
    if (conn) return conn.release();
  }
});

//GET user individual
app.get("/individual_user/:email", async (req, res) => {
  let conn;
  try {
    // establish a connection to MariaDB
    conn = await pool.getConnection();

    // execute the query and set the result to a new variable
    var rows = await conn.query(
      "select u.EMAIL,u.NAME,u.PASSWORD,iu.LOCATION  from USERS u INNER JOIN INDIVIDUAL_USER iu ON u.EMAIL = iu.EMAIL where u.EMAIL = ?",
      [req.params.email]
    );
    // return the results
    res.send(rows);
  } catch (err) {
    throw err;
  } finally {
    if (conn) return conn.release();
  }
});

//GET company
app.get("/company/:email", async (req, res) => {
  let conn;
  try {
    // establish a connection to MariaDB
    conn = await pool.getConnection();

    // execute the query and set the result to a new variable
    var rows = await conn.query(
      "select u.EMAIL,u.NAME,u.PASSWORD,c.DESCRIPTION from USERS u INNER JOIN COMPANIES c ON u.EMAIL = c.EMAIL where u.EMAIL = ?",
      [req.params.email]
    );
    // return the results
    res.send(rows);
  } catch (err) {
    throw err;
  } finally {
    if (conn) return conn.release();
  }
});

// LOGIN
app.get("/login", async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();

    var email = req.body.email;
    var password = req.body.password;

    //S'hauria de comprovar que no existeix el username i assginar l'id automaticament
    conn
      .query("SELECT * FROM USERS WHERE EMAIL = ? AND PASSWORD = ?;", [
        email,
        password,
      ])
      .then((result) => {
        var token = jwt.sign({ username: email }, "supersecret");
        res.send(token);
      })
      .catch((err) => {
        throw err;
      });
  } catch (err) {
    throw err;
  } finally {
    if (conn) return conn.release();
  }
});

/**********************POST***********************/

// Add a new user
app.post("/registerIndividualUser", async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    conn
      .query("INSERT INTO USERS VALUES(?,?,?);", [
        req.body.email,
        req.body.username,
        req.body.password,
      ])
      .then((result) => {
        conn
          .query("INSERT INTO INDIVIDUAL_USER VALUES(?,?);", [
            req.body.email,
            null,
          ])
          .then((result) => {
            res.status(201).send("user added");
          })
          .catch((err) => {
            throw err;
          });
      })
      .catch((err) => {
        throw err;
      });
  } catch (err) {
    throw err;
  } finally {
    if (conn) return conn.release();
  }
});

// Add a company
app.post("/registerCompany", async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    conn
      .query("INSERT INTO USERS VALUES(?,?,?);", [
        req.body.email,
        req.body.username,
        req.body.password,
      ])
      .then((result) => {
        conn
          .query("INSERT INTO COMPANIES VALUES(?,?);", [
            req.body.email,
            req.body.description,
          ])
          .then((result) => {
            res.status(201).send("company added");
          })
          .catch((err) => {
            throw err;
          });
      })
      .catch((err) => {
        throw err;
      });
  } catch (err) {
    throw err;
  } finally {
    if (conn) return conn.release();
  }
});

// Add a new establishment
app.post("/registerEstablishment", async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    conn
      .query(
        "INSERT INTO ESTABLISHMENT (OWNER,LOCAL_X,LOCAL_Y,DESCRIPTION,MAX_CAPACITY,SCHEDULE) VALUES(?,?,?,?,?,?);",
        [
          req.body.owner,
          req.body.local_x,
          req.body.local_y,
          req.body.description,
          req.body.max_capacity,
          req.body.schedule,
        ]
      )
      .then((result) => {
        res.status(201).send("establishment added");
      });
  } catch (err) {
    throw err;
  } finally {
    if (conn) return conn.release();
  }
});

/**********************PUT***********************/

// Update an existing user
app.put("/usuarios/:email", (request, response) => {
  const id = request.params.id;

  pool.query(
    "UPDATE users SET ? WHERE email = ?",
    [request.body, id],
    (error, result) => {
      if (error) throw error;

      response.send("User updated successfully.");
    }
  );
});



//Update user name
app.put("/users/name/:email", async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
        conn
          .query(
            "UPDATE USERS SET NAME = ? WHERE EMAIL = ?",
            [
              req.body.value,
              req.params.email
            ]
          )
          .then((result) => {
            res.status(201).send("user name updated");
          });
      } catch (err) {
        throw err;
      } finally {
        if (conn) return conn.release();
      }
});

//Update user password
app.put("/users/password/:email", async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
        conn
          .query(
            "UPDATE USERS SET PASSWORD = ? WHERE EMAIL = ?",
            [
              req.body.value,
              req.params.email
            ]
          )
          .then((result) => {
            res.status(201).send("user password updated");
          });
      } catch (err) {
        throw err;
      } finally {
        if (conn) return conn.release();
      }
});

//Update company description
app.put("/company/description/:email", async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
        conn
          .query(
            "UPDATE COMPANIES SET DESCRIPTION = ? WHERE EMAIL = ?",
            [
              req.body.value,
              req.params.email
            ]
          )
          .then((result) => {
            res.status(201).send("company description updated");
          });
      } catch (err) {
        throw err;
      } finally {
        if (conn) return conn.release();
      }
});

//Update establishment location
app.put("/establishment/location/:id", async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
        conn
          .query(
            "UPDATE ESTABLISHMENT SET LOCAL_X = ?, LOCAL_Y = ? WHERE ID_ESTABLISHMENT = ?",
            [
              req.body.value1,
              req.body.value2,
              req.params.id
            ]
          )
          .then((result) => {
            res.status(201).send("Establishment location updated");
          });
      } catch (err) {
        throw err;
      } finally {
        if (conn) return conn.release();
      }
});

//Update establishment name
app.put("/establishment/name/:id", async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
        conn
          .query(
            "UPDATE ESTABLISHMENT SET NAME = ? WHERE ID_ESTABLISHMENT = ?",
            [
              req.body.value,
              req.params.id
            ]
          )
          .then((result) => {
            res.status(201).send("Establishment name updated");
          });
      } catch (err) {
        throw err;
      } finally {
        if (conn) return conn.release();
      }
});

//Update establishment schedule
app.put("/establishment/schedule/:id", async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
        conn
          .query(
            "UPDATE ESTABLISHMENT SET SCHEDULE = ? WHERE ID_ESTABLISHMENT = ?",
            [
              req.body.value,
              req.params.id
            ]
          )
          .then((result) => {
            res.status(201).send("Establishment schedule updated");
          });
      } catch (err) {
        throw err;
      } finally {
        if (conn) return conn.release();
      }
});

//Update company max capacity
app.put("/establishment/capacity/:email", async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
        conn
          .query(
            "UPDATE ESTABLISHMENT SET MAX_CAPACITY = ? WHERE EMAIL = ?",
            [
              req.body.value,
              req.params.email
            ]
          )
          .then((result) => {
            res.status(201).send("company max_capacity updated");
          });
      } catch (err) {
        throw err;
      } finally {
        if (conn) return conn.release();
      }
});
/**********************DELETE***********************/

// Delete a user
app.delete("/IndividualUser/:email", async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    conn
      .query("DELETE FROM INDIVIDUAL_USER WHERE email = ?", [req.params.email])
      .then((result) => {
        conn
          .query("DELETE FROM USERS WHERE email = ?", [req.params.email])
          .then((result) => {
            res.status(201).send("Individual User deleted");
          })
          .catch((err) => {
            throw err;
          });
      })
      .catch((err) => {
        throw err;
      });
  } catch (err) {
    throw err;
  } finally {
    if (conn) return conn.release();
  }
});

app.delete("/Company/:email", async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    conn
      .query("DELETE FROM COMPANIES WHERE email = ?", [req.params.email])
      .then((result) => {
        conn
          .query("DELETE FROM USERS WHERE email = ?", [req.params.email])
          .then((result) => {
            res.status(201).send("company deleted");
          })
          .catch((err) => {
            throw err;
          });
      })
      .catch((err) => {
        throw err;
      });
  } catch (err) {
    throw err;
  } finally {
    if (conn) return conn.release();
  }
});

app.listen(3000, function () {
  console.log("now listening for requests");
});

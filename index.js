require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
const pool = require("./db");
var jwt = require("jsonwebtoken");

/**
 * Obtenir els establiments a partir d'un token que us posaré en el header, aquest token es decodifica i obtens el correu
 *
 *
 */

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors());

const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];

    jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }
      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};

app.get("/api", (req, res) => res.send("Its working!"));

app.get("/users", async (req, res) => {
  let conn;
  try {
    // establish a connection to MariaDB
    conn = await pool.getConnection();

    // execute the query and set the result to a new variable
    var rows = await conn.query("select * from USERS");
  } catch {
    res.status(500).send("Error connecting db");
  } finally {
    // return the resultsyou
    res.status(200).send(rows);
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
  } catch {
    res.status(500).send("Error connecting db");
  } finally {
    // return the results
    if (rows.length != 0) res.status(200).send(rows);
    else res.status(404).send("Email not found");
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
  } catch {
    res.status(500).send("Error connecting db");
  } finally {
    // return the results
    if (rows.length != 0) res.status(200).send(rows);
    else res.status(404).send("Email not found");
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
  } catch {
    res.status(500).send("Error connecting db");
  } finally {
    // return the results
    if (rows.length != 0) res.status(200).send(rows);
    else res.status(404).send("Email not found");
    if (conn) return conn.release();
  }
});

//GET all establishments
app.get("/establishments", async (req, res) => {
  let conn;
  try {
    // establish a connection to MariaDB
    conn = await pool.getConnection();

    // execute the query and set the result to a new variable
    var rows = await conn.query("select * from ESTABLISHMENT", [
      req.params.email,
    ]);
  } catch {
    res.status(500).send("Error connecting db");
  } finally {
    // return the results
    res.status(200).send(rows);
    if (conn) return conn.release();
  }
});

//GET establishment by id
app.get("/establishments/:id", async (req, res) => {
  let conn;
  try {
    // establish a connection to MariaDB
    conn = await pool.getConnection();

    // execute the query and set the result to a new variable
    var rows = await conn.query(
      "select * from ESTABLISHMENT where ID_ESTABLISHMENT = ?",
      [req.params.id]
    );
  } catch {
    res.status(500).send("Error connecting db");
  } finally {
    // return the results
    if (rows.length != 0) res.status(200).send(rows);
    else res.status(404).send("Id not found");
    if (conn) return conn.release();
  }
});

//una alternativa a usar el bearer token para pasar el email que me parece bastante raro
/*app.get("/company/:email/establishments", async (req, res) => {
  let conn;
  try {
    // establish a connection to MariaDB
    conn = await pool.getConnection();

    // execute the query and set the result to a new variable
    var rows = await conn.query(
      "select ID_ESTABLISHMENT from ESTABLISHMENT where OWNER = ?",
      [req.params.email]
    );
  } catch {
    res.status(500).send("Error connecting db");
  } finally {
    // return the results
    if (rows.length != 0) res.status(200).send(rows);
    else res.status(404).send("No establishments found");
    if (conn) return conn.release();
  }
});*/

//JA FUNCIONA!!
app.get("/myEstablishments", authenticateJWT, async (req, res) => {
  let conn;
  try {
    // establish a connection to MariaDB
    conn = await pool.getConnection();

    // execute the query and set the result to a new variable
    var rows = await conn.query("select * from ESTABLISHMENT where OWNER = ?", [
      req.user.username,
    ]);
  } catch {
    res.status(500).send("Error connecting db");
  } finally {
    // return the results
    res.status(200).send(rows);
    if (conn) return conn.release();
  }
});

app.get("/myEvents", authenticateJWT, async (req, res) => {
  let conn;
  try {
    // establish a connection to MariaDB
    conn = await pool.getConnection();

    // execute the query and set the result to a new variable
    var rows = await conn.query("select * from EVENTS where VENUE_OWNER = ?", [
      req.user.username,
    ]);
  } catch {
    res.status(500).send("Error connecting db");
  } finally {
    // return the results
    res.status(200).send(rows);
    if (conn) return conn.release();
  }
});

app.get("/Establishment/:id/Events", authenticateJWT, async (req, res) => {
  let conn;
  try {
    // establish a connection to MariaDB
    conn = await pool.getConnection();

    // execute the query and set the result to a new variable
    var rows = await conn.query("select * from EVENTS where VENUE_ID = ?", [
      req.params.id,
    ]);
  } catch {
    res.status(500).send("Error connecting db");
  } finally {
    // return the results
    res.status(200).send(rows);
    if (conn) return conn.release();
  }
});

/**********************POST***********************/

// LOGIN individual users
app.post("/user/login", async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();

    var email = req.body.email;
    var password = req.body.password;

    var rows = await conn.query(
      "select u.EMAIL from USERS u INNER JOIN INDIVIDUAL_USER iu ON u.EMAIL = iu.EMAIL where u.EMAIL = ? and u.PASSWORD = ?",
      [email, password]
    );
  } catch {
    res.status(500).send("Error connecting db");
  }
  try {
    if (rows.length != 0) {
      var token = jwt.sign({ username: email }, process.env.TOKEN_SECRET);
    } else {
      res.status(404).send("Email or password not correct");
    }
  } catch {
    res.status(500).send("Error creating token");
  } finally {
    res.status(200).send(token);
    if (conn) return conn.release();
  }
});

// LOGIN COMPANIES
app.post("/login/company", async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();

    var email = req.body.email;
    var password = req.body.password;

    var rows = await conn.query(
      "select u.EMAIL from USERS u INNER JOIN COMPANIES c ON u.EMAIL = c.EMAIL where u.EMAIL = ? and u.PASSWORD = ?",
      [email, password]
    );
  } catch {
    res.status(500).send("Error connecting db");
  }
  try {
    if (rows.length != 0) {
      var token = jwt.sign({ username: email }, process.env.TOKEN_SECRET);
    } else {
      res.status(404).send("Email or password not correct");
    }
  } catch {
    res.status(500).send("Error creating token");
  } finally {
    res.status(200).json(token);
    if (conn) return conn.release();
  }
});

// COMPROVAR QUE FUNCIONA BE!!
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
            res.status(201).send("User added");
          })
          .catch((err) => {
            throw err;
          });
      })
      .catch((err) => {
        res.status(409).send("User already exist");
      });
  } catch (err) {
    res.status(500).send("Error connecting db");
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
            res.status(201).send("Company added");
          })
          .catch((err) => {
            throw err;
          });
      })
      .catch((err) => {
        res.status(409).send("Company already exist");
      });
  } catch (err) {
    res.status(500).send("Error connecting db");
  } finally {
    if (conn) return conn.release();
  }
});

// Add a new establishment
//Hauriem de millorar l'assignació d'id i alguna forma de comprovació per no duplicar establishments
//re:No hay ningun beneficio de mejorar la asignacion de ids, no causan ningun problema, para no duplicar podemos crear un check de DB
app.post("/registerEstablishment", async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();

    var rows = await conn.query("SELECT * FROM COMPANIES WHERE EMAIL = ?", [
      req.body.owner,
    ]);
    if (rows.length == 0) res.status(404).send("Owner not exists");

    conn
      .query(
        "INSERT INTO ESTABLISHMENT (OWNER,LOCAL_X,LOCAL_Y,DESCRIPTION,MAX_CAPACITY,SCHEDULE, NAME, CATEGORY, PRICE, RATING, DISCOUNT, ADDRESS) VALUES(?,?,?,?,?,?,?,?,?,?,?,?);",
        [
          req.body.owner,
          req.body.local_x,
          req.body.local_y,
          req.body.description,
          req.body.max_capacity,
          req.body.schedule,
          req.body.name,
          req.body.category,
          req.body.price,
          req.body.rating,
          req.body.discount,
          req.body.address,
        ]
      )
      .then((result) => {
        res.status(201).send("Establishment added");
      })
      .catch((err) => {
        res.status(409).send("Establishment already exist");
      });
  } catch (err) {
    res.status(500).send("Error connecting db");
  } finally {
    if (conn) return conn.release();
  }
});

app.post("/Event", authenticateJWT, async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    conn
      .query(
        "INSERT INTO EVENTS (VENUE_ID,VENUE_OWNER,EVENT_DATE,EVENT_TIME,NAME,DESCRIPTION,CAPACITY) VALUES(?,?,?,?,?,?,?);",
        [
          req.body.venue_id,
          req.user.username,
          req.body.event_date,
          req.body.event_time,
          req.body.name,
          req.body.description,
          req.body.capacity,
        ]
      )
      .then((result) => {
        res.status(201).send("Event added");
      })
      .catch((err) => {
        res.status(409).send("Error in creation of the event");
      });
  } catch (err) {
    res.status(500).send("Error connecting db");
  } finally {
    if (conn) return conn.release();
  }
});

/**********************PUT***********************/
//Update user name
app.put("/users/name/:email", async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    conn
      .query("UPDATE USERS SET NAME = ? WHERE EMAIL = ?", [
        req.body.value,
        req.params.email,
      ])
      .then((result) => {
        if (result.affectedRows == 0) res.status(404).send("Email not found");
        else res.status(201).send("user name updated");
      });
  } catch (err) {
    res.status(500).send("Error connecting db");
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
      .query("UPDATE USERS SET PASSWORD = ? WHERE EMAIL = ?", [
        req.body.value,
        req.params.email,
      ])
      .then((result) => {
        if (result.affectedRows == 0) res.status(404).send("Email not found");
        else res.status(201).send("user password updated");
      });
  } catch (err) {
    res.status(500).send("Error connecting db");
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
      .query("UPDATE COMPANIES SET DESCRIPTION = ? WHERE EMAIL = ?", [
        req.body.value,
        req.params.email,
      ])
      .then((result) => {
        if (result.affectedRows == 0) res.status(404).send("Email not found");
        else res.status(201).send("company description updated");
      });
  } catch (err) {
    res.status(500).send("Error connecting db");
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
        [req.body.value1, req.body.value2, req.params.id]
      )
      .then((result) => {
        if (result.affectedRows == 0) res.status(404).send("Id not found");
        else res.status(201).send("Establishment location updated");
      });
  } catch (err) {
    res.status(500).send("Error connecting db");
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
      .query("UPDATE ESTABLISHMENT SET NAME = ? WHERE ID_ESTABLISHMENT = ?", [
        req.body.value,
        req.params.id,
      ])
      .then((result) => {
        if (result.affectedRows == 0) res.status(404).send("Id not found");
        else res.status(201).send("Establishment name updated");
      });
  } catch (err) {
    res.status(500).send("Error connecting db");
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
        [req.body.value, req.params.id]
      )
      .then((result) => {
        if (result.affectedRows == 0) res.status(404).send("Id not found");
        else res.status(201).send("Establishment schedule updated");
      });
  } catch (err) {
    res.status(500).send("Error connecting db");
  } finally {
    if (conn) return conn.release();
  }
});

//Update establishment max capacity
app.put("/establishment/capacity/:id", async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    conn
      .query(
        "UPDATE ESTABLISHMENT SET MAX_CAPACITY = ? WHERE ID_ESTABLISHMENT = ?",
        [req.body.value, req.params.id]
      )
      .then((result) => {
        if (result.affectedRows == 0) res.status(404).send("Id not found");
        else res.status(201).send("Establishment max_capacity updated");
      });
  } catch (err) {
    res.status(500).send("Error connecting db");
  } finally {
    if (conn) return conn.release();
  }
});

//Update establishment category
app.put("/establishment/category/:id", async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    conn
      .query(
        "UPDATE ESTABLISHMENT SET CATEGORY = ? WHERE ID_ESTABLISHMENT = ?",
        [req.body.value, req.params.id]
      )
      .then((result) => {
        if (result.affectedRows == 0) res.status(404).send("Id not found");
        else res.status(201).send("Establishment category updated");
      });
  } catch (err) {
    res.status(500).send("Error connecting db");
  } finally {
    if (conn) return conn.release();
  }
});

//Update establishment price
app.put("/establishment/price/:id", async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    conn
      .query("UPDATE ESTABLISHMENT SET PRICE = ? WHERE ID_ESTABLISHMENT = ?", [
        req.body.value,
        req.params.id,
      ])
      .then((result) => {
        if (result.affectedRows == 0) res.status(404).send("Id not found");
        else res.status(201).send("Establishment price updated");
      });
  } catch (err) {
    res.status(500).send("Error connecting db");
  } finally {
    if (conn) return conn.release();
  }
});

//Update establishment rating
app.put("/establishment/rating/:id", async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    conn
      .query("UPDATE ESTABLISHMENT SET RATING = ? WHERE ID_ESTABLISHMENT = ?", [
        req.body.value,
        req.params.id,
      ])
      .then((result) => {
        if (result.affectedRows == 0) res.status(404).send("Id not found");
        else res.status(201).send("Establishment rating updated");
      });
  } catch (err) {
    res.status(500).send("Error connecting db");
  } finally {
    if (conn) return conn.release();
  }
});

//Update establishment discount
app.put("/establishment/discount/:id", async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    conn
      .query(
        "UPDATE ESTABLISHMENT SET DISCOUNT = ? WHERE ID_ESTABLISHMENT = ?",
        [req.body.value, req.params.id]
      )
      .then((result) => {
        if (result.affectedRows == 0) res.status(404).send("Id not found");
        else res.status(201).send("Establishment discount updated");
      });
  } catch (err) {
    res.status(500).send("Error connecting db");
  } finally {
    if (conn) return conn.release();
  }
});

//Update establishment address
app.put("/establishment/address/:id", async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    conn
      .query(
        "UPDATE ESTABLISHMENT SET ADDRESS = ? WHERE ID_ESTABLISHMENT = ?",
        [req.body.value, req.params.id]
      )
      .then((result) => {
        if (result.affectedRows == 0) res.status(404).send("Id not found");
        else res.status(201).send("Establishment address updated");
      });
  } catch (err) {
    res.status(500).send("Error connecting db");
  } finally {
    if (conn) return conn.release();
  }
});

/**********************DELETE***********************/

// Delete a user
/*
app.delete("/IndividualUser/:email", async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    conn
      .query("DELETE FROM INDIVIDUAL_USER WHERE email = ?", [req.params.email])
      .then((result) => {
        if (result.affectedRows == 0) res.status(404).send("Email not found");
        else
          conn
            .query("DELETE FROM USERS WHERE email = ?", [req.params.email])
            .then((result) => {
              if (result.affectedRows == 0)
                res.status(404).send("Email not found");
              else res.status(201).send("Individual User deleted");
            })
            .catch((err) => {
              throw err;
            });
      })
      .catch((err) => {
        throw err;
      });
  } catch (err) {
    res.status(500).send("Error connecting db");
  } finally {
    if (conn) return conn.release();
  }
});

app.delete("/Company/:email", async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();

    conn
      .query("DELETE FROM ESTABLISHMENT WHERE OWNER = ?", [req.params.email])
      .then((result) => {
        conn
          .query("DELETE FROM COMPANIES WHERE email = ?", [req.params.email])
          .then((result) => {
            if (result.affectedRows == 0)
              res.status(404).send("Email not found");
            else
              conn
                .query("DELETE FROM USERS WHERE email = ?", [req.params.email])
                .then((result) => {
                  if (result.affectedRows == 0)
                    res.status(404).send("Email not found");
                  else res.status(201).send("Company deleted");
                })
                .catch((err) => {
                  throw err;
                });
          })
          .catch((err) => {
            throw err;
          });
      })
      .catch((err) => {
        throw err;
      });
  } catch (err) {
    res.status(500).send("Error connecting db");
  } finally {
    if (conn) return conn.release();
  }
});
*/

//Delete establishment
app.delete("/establishment/:id", async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    conn
      .query("DELETE FROM ESTABLISHMENT WHERE ID_ESTABLISHMENT = ?", [
        req.params.id,
      ])
      .then((result) => {
        if (result.affectedRows == 0) res.status(404).send("Id not found");
        else res.status(201).send("Establishment deleted successfully");
      });
  } catch (err) {
    res.status(500).send("Error connecting db");
  } finally {
    if (conn) return conn.release();
  }
});

//Delete user funciona para los dos tipos, necesita el token del usuario
app.delete("/user", authenticateJWT, async (req, res) => {
  let conn;

  try {
    conn = await pool.getConnection();
    conn
      .query("DELETE FROM USERS WHERE EMAIL = ?", [
        req.user.username,
      ])
      .then((result) => {
        if (result.affectedRows == 0) res.status(404).send("Id not found");
        else res.status(201).send("User deleted");
      });
  } catch (err) {
    res.status(500).send("Error connecting db");
  } finally {
    if (conn) return conn.release();
  }
});

app.listen(3000, function () {
  console.log("now listening for requests");
});

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

app.get("/api",  (req, res) => res.send("Its working!"));

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
    var rows = await conn.query("select * from ESTABLISHMENTS", [
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
      "select * from ESTABLISHMENTS where ID_ESTABLISHMENT = ?",
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
    var rows = await conn.query("select * from ESTABLISHMENTS where OWNER = ?", [
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
//GET all events of token's user
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
//GET all events for an establishment by id
app.get("/Establishment/:id/Events",  async (req, res) => {
  let conn;
  try {
    // establish a connection to MariaDB
    conn = await pool.getConnection();

    // execute the query and set the result to a new variable
    var rows = await conn.query("select * from EVENTS where ID_VENUE = ?", [
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

//Return space available for reservation
app.get("/Establishment/:id/reserveSpaceLeft",  async (req, res) => {
  let conn;
  try {
    // establish a connection to MariaDB
    conn = await pool.getConnection();

    // execute the query and set the result to a new variable
    var rows = await conn.query(
      "select e.MAX_CAPACITY-SUM(r.PEOPLE_COUNT) as Space_Left from ESTABLISHMENTS e, RESERVATIONS r where e.ID_ESTABLISHMENT = ? AND r.RESERVATION_DATE = ? AND r.RESERVATION_HOUR = ? AND e.ID_ESTABLISHMENT = r.ID_ESTABLISHMENT ",
      [
      req.params.id,
      req.body.reservation_date,
      req.body.reservation_hour,
      ]
    );
  } catch {
    res.status(500).send("Error connecting db");
  } finally {
    // return the results
    if (rows.length != 0){
    res.status(200).send(rows);
    }
    else res.status(404).send("Id not found");
    if (conn) return conn.release();
  }
});

//GET all events
app.get("/Events",  async (req, res) => {
  let conn;
  try {
    // establish a connection to MariaDB
    conn = await pool.getConnection();

    // execute the query and set the result to a new variable
    var rows = await conn.query("select * from EVENTS");
  } catch {
    res.status(500).send("Error connecting db");
  } finally {
    // return the results
    res.status(200).send(rows);
    if (conn) return conn.release();
  }
});
//GET an event by its id
app.get("/Events/:id",   async (req, res) => {
  let conn;
  try {
    // establish a connection to MariaDB
    conn = await pool.getConnection();

    // execute the query and set the result to a new variable
    var rows = await conn.query("select * from EVENTS where ID_EVENT = ?",[
      req.params.id
      ]);
  } catch {
    res.status(500).send("Error connecting db");
  } finally {
    // return the results
    res.status(200).send(rows);
    if (conn) return conn.release();
  }
});
//GET all ratings of and establishment by id
app.get("/Establishment/:id/Ratings",  async (req, res) => {
  let conn;
  try {
    // establish a connection to MariaDB
    conn = await pool.getConnection();

    // execute the query and set the result to a new variable
    var rows = await conn.query("select * from RATINGS where ID_ESTABLISHMENT = ?", [
      req.params.id,
    ]);
  } catch {
    res.status(500).send(err);
  } finally {
    // return the results
    res.status(200).send(rows);
    if (conn) return conn.release();
  }
});
//GET and average of ratings of an establishment by id
app.get("/Establishment/:id/AverageRating", async (req, res) => {
  let conn;
  try {
    // establish a connection to MariaDB
    conn = await pool.getConnection();

    // execute the query and set the result to a new variable
    var rows = await conn.query("select AVG(VALUE) from RATINGS where ID_ESTABLISHMENT = ?", [
      req.params.id,
    ]);
  } catch {
    res.status(500).send(err);
  } finally {
    // return the results
    res.status(200).send(rows);
    if (conn) return conn.release();
  }
});
//GET all ratings of token's user
app.get("/User/Ratings", authenticateJWT, async (req, res) => {
  let conn;
  try {
    // establish a connection to MariaDB
    conn = await pool.getConnection();

    // execute the query and set the result to a new variable
    var rows = await conn.query("select * from RATINGS where ID_AUTHOR = ?", [
      req.user.username,
    ]);
  } catch {
    res.status(500).send(err);
  } finally {
    // return the results
    res.status(200).send(rows);
    if (conn) return conn.release();
  }
});
//GET all reservations of token's user
app.get("/User/Reservations", authenticateJWT, async (req, res) => {
  let conn;
  try {
    // establish a connection to MariaDB
    conn = await pool.getConnection();

    // execute the query and set the result to a new variable
    var rows = await conn.query("select * from RESERVATIONS where ID_AUTHOR = ?", [
      req.user.username,
    ]);
  } catch {
    res.status(500).send(err);
  } finally {
    // return the results
    res.status(200).send(rows);
    if (conn) return conn.release();
  }
});
//GET all reservations
app.get("/Reservations", authenticateJWT,  async (req, res) => {
  let conn;
  try {
    // establish a connection to MariaDB
    conn = await pool.getConnection();

    // execute the query and set the result to a new variable
    var rows = await conn.query("select * from RESERVATIONS");
  } catch {
    res.status(500).send("Error connecting db");
  } finally {
    // return the results
    res.status(200).send(rows);
    if (conn) return conn.release();
  }
});
//GET reservation by id, will only return if the user asks for his own reservation
app.get("/Reservations/:id", authenticateJWT, async (req, res) => {
  let conn;
  try {
    // establish a connection to MariaDB
    conn = await pool.getConnection();

    // execute the query and set the result to a new variable
    var rows = await conn.query(
      "select * from RESERVATIONS where ID_RESERVATION = ? AND ID_AUTHOR = ?",
      [
      req.params.id,
      req.user.username
      ]
    );
  } catch {
    res.status(500).send("Error connecting db");
  } finally {
    // return the results
    if (rows.length != 0) res.status(200).send(rows);
    else res.status(404).send("No such reservation for this user");
    if (conn) return conn.release();
  }
});

//GET all events for an establishment by id
app.get("/Establishment/:id/Reservations",  async (req, res) => {
  let conn;
  try {
    // establish a connection to MariaDB
    conn = await pool.getConnection();

    // execute the query and set the result to a new variable
    var rows = await conn.query("select * from RESERVATIONS where ID_ESTABLISHMENT = ?", [
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
app.post("/registerIndividualUser",  async (req, res) => {
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
app.post("/registerEstablishment", authenticateJWT, async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();

    var rows = await conn.query("SELECT * FROM COMPANIES WHERE EMAIL = ?", [
      req.user.username,
    ]);
    if (rows.length == 0) res.status(404).send("Owner not exists");

    conn
      .query(
        "INSERT INTO ESTABLISHMENTS (OWNER,LOCAL_X,LOCAL_Y,DESCRIPTION,MAX_CAPACITY, HOUROPEN, HOURCLOSE, NAME, CATEGORY, PRICE, DISCOUNT, ADDRESS, WEBSITE, INSTAGRAM) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?);",
        [
          req.user.username,
          req.body.local_x,
          req.body.local_y,
          req.body.description,
          req.body.max_capacity,
          req.body.houropen,
          req.body.hourclose,
          req.body.name,
          req.body.category,
          req.body.price,
          req.body.discount,
          req.body.address,
          req.body.website,
          req.body.instagram,
        ]
      )
      .then((result) => {
        res.status(201).send("Establishment added");
      })
      .catch((err) => {
        res.status(409).send("Establishment already exists");
      });
  } catch (err) {
    res.status(500).send("Error connecting to the DB");
  } finally {
    if (conn) return conn.release();
  }
});

app.post("/registerEvent", authenticateJWT, async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    conn
      .query(
        "INSERT INTO EVENTS (ID_VENUE,VENUE_OWNER,EVENT_DATE,HOURSTART, HOUREND, NAME,DESCRIPTION,CAPACITY) VALUES(?,?,?,?,?,?,?,?);",
        [
          req.body.venue_id,
          req.user.username,
          req.body.event_date,
          req.body.hourstart,
          req.body.hourend,
          req.body.name,
          req.body.description,
          req.body.capacity,
        ]
      )
      .then((result) => {
        res.status(201).send("Event added");
      })
      .catch((err) => {
        res.status(409).send(err);
      });
  } catch (err) {
    res.status(500).send("Error connecting db");
  } finally {
    if (conn) return conn.release();
  }
});

app.post("/registerRating", authenticateJWT, async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    conn
      .query(
        "INSERT INTO RATINGS (VALUE,DESCRIPTION,PREVIOUS_BOOKING,ID_AUTHOR,ID_ESTABLISHMENT) VALUES(?,?,?,?,?);",
        [
          req.body.value,
          req.body.description,
          req.body.previous_booking,
          req.user.username,
          req.body.establishment_id
        ]
      )
      .then((result) => {
        res.status(201).send("Rating added");
      })
      .catch((err) => {
        res.status(409).send(err);
      });
  } catch (err) {
    res.status(500).send(err);
  } finally {
    if (conn) return conn.release();
  }
});

app.post("/registerReservation", authenticateJWT, async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    conn
      .query(
        "INSERT INTO RESERVATIONS (ID_ESTABLISHMENT,ID_AUTHOR,PEOPLE_COUNT,RESERVATION_DATE,RESERVATION_HOUR) VALUES(?,?,?,?,?);",
        [
          req.body.id_establishment,
          req.user.username,
          req.body.people_count,
          req.body.reservation_date,
          req.body.reservation_hour
        ]
      )
      .then((result) => {
        res.status(201).send("Reservation added");
      })
      .catch((err) => {
        res.status(409).send(err);
      });
  } catch (err) {
    res.status(500).send(err);
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
app.put("/establishment/location/:id", authenticateJWT, async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    conn
      .query(
        "UPDATE ESTABLISHMENTS SET LOCAL_X = ?, LOCAL_Y = ? WHERE ID_ESTABLISHMENT = ? AND OWNER = ?",
        [
        req.body.value1,
        req.body.value2,
        req.params.id,
        req.user.username,
        ]
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
app.put("/establishment/name/:id", authenticateJWT, async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    conn
      .query("UPDATE ESTABLISHMENTS SET NAME = ? WHERE ID_ESTABLISHMENT = ? AND OWNER = ?", [
        req.body.value,
        req.params.id,
        req.user.username,
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
app.put("/establishment/houropen/:id", authenticateJWT, async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    conn
      .query(
        "UPDATE ESTABLISHMENTS SET HOUROPEN = ?, HOURCLOSE = ? WHERE ID_ESTABLISHMENT = ? AND OWNER = ?",
        [
        req.body.value1,
        req.body.value2,
        req.params.id,
        req.user.username,
        ]
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
app.put("/establishment/capacity/:id", authenticateJWT, async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    conn
      .query(
        "UPDATE ESTABLISHMENTS SET MAX_CAPACITY = ? WHERE ID_ESTABLISHMENT = ? AND OWNER = ?",
        [
        req.body.value,
        req.params.id,
        req.user.username,
        ]
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
app.put("/establishment/category/:id", authenticateJWT, async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    conn
      .query(
        "UPDATE ESTABLISHMENTS SET CATEGORY = ? WHERE ID_ESTABLISHMENT = ? AND OWNER = ?",
        [
        req.body.value,
        req.params.id,
        req.user.username,
        ]
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
app.put("/establishment/price/:id", authenticateJWT, async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    conn
      .query("UPDATE ESTABLISHMENTS SET PRICE = ? WHERE ID_ESTABLISHMENT = ? AND OWNER = ?", [
        req.body.value,
        req.params.id,
        req.user.username,
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

//Update establishment discount
app.put("/establishment/discount/:id", authenticateJWT, async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    conn
      .query(
        "UPDATE ESTABLISHMENTS SET DISCOUNT = ? WHERE ID_ESTABLISHMENT = ? AND OWNER = ?",
        [
        req.body.value,
        req.params.id,
        req.user.username,
        ]
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
app.put("/establishment/address/:id", authenticateJWT, async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    conn
      .query(
        "UPDATE ESTABLISHMENTS SET ADDRESS = ? WHERE ID_ESTABLISHMENT = ? AND OWNER = ?",
        [
        req.body.value,
        req.params.id,
        req.user.username,
        ]
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

//Update establishment website
app.put("/establishment/website/:id", authenticateJWT, async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    conn
      .query(
        "UPDATE ESTABLISHMENTS SET WEBSITE = ? WHERE ID_ESTABLISHMENT = ? AND OWNER = ?",
        [
        req.body.value,
        req.params.id,
        req.user.username,
        ]
      )
      .then((result) => {
        if (result.affectedRows == 0) res.status(404).send("Id not found");
        else res.status(201).send("Establishment website updated");
      });
  } catch (err) {
    res.status(500).send("Error connecting db");
  } finally {
    if (conn) return conn.release();
  }
});

//Update establishment instagram
app.put("/establishment/instagram/:id", authenticateJWT, async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    conn
      .query(
        "UPDATE ESTABLISHMENTS SET INSTAGRAM = ? WHERE ID_ESTABLISHMENT = ? AND OWNER = ?",
        [
        req.body.value,
        req.params.id,
        req.user.username,
        ]
      )
      .then((result) => {
        if (result.affectedRows == 0) res.status(404).send("Id not found");
        else res.status(201).send("Establishment instagram updated");
      });
  } catch (err) {
    res.status(500).send("Error connecting db");
  } finally {
    if (conn) return conn.release();
  }
});

//Update establishment description
app.put("/establishment/description/:id", authenticateJWT, async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    conn
      .query(
        "UPDATE ESTABLISHMENTS SET DESCRIPTION = ? WHERE ID_ESTABLISHMENT = ? AND OWNER = ?",
        [
        req.body.value,
        req.params.id,
        req.user.username,
        ]
      )
      .then((result) => {
        if (result.affectedRows == 0) res.status(404).send("Id not found");
        else res.status(201).send("Establishment description updated");
      });
  } catch (err) {
    res.status(500).send("Error connecting db");
  } finally {
    if (conn) return conn.release();
  }
});

// TODOS LOS UPDATES DE EVENT NECESITAN TOKEN DEL OWNER
//Update event date
app.put("/event/event_date/:id", authenticateJWT, async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    conn
      .query(
        "UPDATE EVENTS SET EVENT_DATE = ? WHERE ID_EVENT = ? AND VENUE_OWNER = ?",
        [
        req.body.value,
        req.params.id,
        req.user.username,
        ]
      )
      .then((result) => {
        if (result.affectedRows == 0) res.status(404).send("Id not found");
        else res.status(201).send("Event date updated");
      });
  } catch (err) {
    res.status(500).send("Error connecting db");
  } finally {
    if (conn) return conn.release();
  }
});

//Update event start hour
app.put("/event/start_hour/:id", authenticateJWT, async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    conn
      .query(
        "UPDATE EVENTS SET HOURSTART = ? WHERE ID_EVENT = ? AND VENUE_OWNER = ?",
        [
        req.body.value,
        req.params.id,
        req.user.username,
        ]
      )
      .then((result) => {
        if (result.affectedRows == 0) res.status(404).send("Id not found");
        else res.status(201).send("Event start hour updated");
      });
  } catch (err) {
    res.status(500).send("Error connecting db");
  } finally {
    if (conn) return conn.release();
  }
});

//Update event end hour
app.put("/event/end_hour/:id", authenticateJWT, async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    conn
      .query(
        "UPDATE EVENTS SET HOUREND = ? WHERE ID_EVENT = ? AND VENUE_OWNER = ?",
        [
        req.body.value,
        req.params.id,
        req.user.username,
        ]
      )
      .then((result) => {
        if (result.affectedRows == 0) res.status(404).send("Id not found");
        else res.status(201).send("Event end hour updated");
      });
  } catch (err) {
    res.status(500).send("Error connecting db");
  } finally {
    if (conn) return conn.release();
  }
});

//Update event name
app.put("/event/name/:id", authenticateJWT, async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    conn
      .query(
        "UPDATE EVENTS SET NAME = ? WHERE ID_EVENT = ? AND VENUE_OWNER = ?",
        [
        req.body.value,
        req.params.id,
        req.user.username,
        ]
      )
      .then((result) => {
        if (result.affectedRows == 0) res.status(404).send("Id not found");
        else res.status(201).send("Event name updated");
      });
  } catch (err) {
    res.status(500).send("Error connecting db");
  } finally {
    if (conn) return conn.release();
  }
});

//Update event description
app.put("/event/description/:id", authenticateJWT, async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    conn
      .query(
        "UPDATE EVENTS SET NAME = ? WHERE ID_EVENT = ? AND VENUE_OWNER = ?",
        [
        req.body.value,
        req.params.id,
        req.user.username,
        ]
      )
      .then((result) => {
        if (result.affectedRows == 0) res.status(404).send("Id not found");
        else res.status(201).send("Event description updated");
      });
  } catch (err) {
    res.status(500).send("Error connecting db");
  } finally {
    if (conn) return conn.release();
  }
});

//Update event capacity
app.put("/event/capacity/:id", authenticateJWT, async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    conn
      .query(
        "UPDATE EVENTS SET CAPACITY = ? WHERE ID_EVENT = ? AND VENUE_OWNER = ?",
        [
        req.body.value,
        req.params.id,
        req.user.username,
        ]
      )
      .then((result) => {
        if (result.affectedRows == 0) res.status(404).send("Id not found");
        else res.status(201).send("Event capacity updated");
      });
  } catch (err) {
    res.status(500).send("Error connecting db");
  } finally {
    if (conn) return conn.release();
  }
});

//UPDATES DE RATINGS NECESITAN TOKEN DEL AUTOR
//Update rating value
app.put("/rating/value/:id", authenticateJWT, async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    conn
      .query(
        "UPDATE RATINGS SET VALUE = ? WHERE ID_RATING = ? AND ID_AUTHOR = ?",
        [
        req.body.value,
        req.params.id,
        req.user.username,
        ]
      )
      .then((result) => {
        if (result.affectedRows == 0) res.status(404).send("Id not found");
        else res.status(201).send("Rating value updated");
      });
  } catch (err) {
    res.status(500).send("Error connecting db");
  } finally {
    if (conn) return conn.release();
  }
});

//Update rating description
app.put("/rating/description/:id", authenticateJWT, async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    conn
      .query(
        "UPDATE RATINGS SET DESCRIPTION = ? WHERE ID_RATING = ? AND ID_AUTHOR = ?",
        [
        req.body.value,
        req.params.id,
        req.user.username,
        ]
      )
      .then((result) => {
        if (result.affectedRows == 0) res.status(404).send("Id not found");
        else res.status(201).send("Rating description updated");
      });
  } catch (err) {
    res.status(500).send("Error connecting db");
  } finally {
    if (conn) return conn.release();
  }
});

//Update rating previous booking value
app.put("/rating/description/:id", authenticateJWT, async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    conn
      .query(
        "UPDATE RATINGS SET PREVIOUS_BOOKING = ? WHERE ID_RATING = ? AND ID_AUTHOR = ?",
        [
        req.body.value,
        req.params.id,
        req.user.username,
        ]
      )
      .then((result) => {
        if (result.affectedRows == 0) res.status(404).send("Id not found");
        else res.status(201).send("Rating previous booking value updated");
      });
  } catch (err) {
    res.status(500).send("Error connecting db");
  } finally {
    if (conn) return conn.release();
  }
});

//Generic update establishment
app.put("/establishment/:id", authenticateJWT, async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    conn
      .query(
        "UPDATE ESTABLISHMENTS SET "+req.body.parameter+ " = ? WHERE ID_ESTABLISHMENT = ? AND OWNER = ?",
        [
        req.body.value,
        req.params.id,
        req.user.username,
        ]
      )
      .then((result) => {
        if (result.affectedRows == 0) res.status(404).send("Id not found");
        else res.status(201).send("Establishment updated");
      });
  } catch (err) {
    res.status(500).send(err);
  } finally {
    if (conn) return conn.release();
  }
});

//Generic update event
app.put("/event/:id", authenticateJWT, async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    conn
      .query(
        "UPDATE EVENTS SET "+req.body.parameter+ " = ? WHERE ID_EVENT = ? AND VENUE_OWNER = ?",
        [
        req.body.value,
        req.params.id,
        req.user.username,
        ]
      )
      .then((result) => {
        if (result.affectedRows == 0) res.status(404).send("Id not found");
        else res.status(201).send("Event updated");
      });
  } catch (err) {
    res.status(500).send(err);
  } finally {
    if (conn) return conn.release();
  }
});

//Generic update User
app.put("/user/:id", authenticateJWT, async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    conn
      .query(
        "UPDATE USERS SET "+req.body.parameter+ " = ? WHERE EMAIL = ?",
        [
        req.body.value,
        req.user.username,
        ]
      )
      .then((result) => {
        if (result.affectedRows == 0) res.status(404).send("Email not found");
        else res.status(201).send("User updated");
      });
  } catch (err) {
    res.status(500).send(err);
  } finally {
    if (conn) return conn.release();
  }
});


//Generic update Companies
app.put("/company/:id", authenticateJWT, async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    conn
      .query(
        "UPDATE COMPANIES SET "+req.body.parameter+ " = ? WHERE EMAIL = ?",
        [
        req.body.value,
        req.user.username,
        ]
      )
      .then((result) => {
        if (result.affectedRows == 0) res.status(404).send("Email not found");
        else res.status(201).send("Company updated");
      });
  } catch (err) {
    res.status(500).send(err);
  } finally {
    if (conn) return conn.release();
  }
});

//Generic update Individual users
app.put("/individual_user/:id", authenticateJWT, async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    conn
      .query(
        "UPDATE INDIVIDUAL_USER SET "+req.body.parameter+ " = ? WHERE EMAIL = ?",
        [
        req.body.value,
        req.user.username,
        ]
      )
      .then((result) => {
        if (result.affectedRows == 0) res.status(404).send("Email not found");
        else res.status(201).send("Individual user updated");
      });
  } catch (err) {
    res.status(500).send(err);
  } finally {
    if (conn) return conn.release();
  }
});

//Generic update Ratings
app.put("/rating/:id", authenticateJWT, async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    conn
      .query(
        "UPDATE RATINGS SET "+req.body.parameter+ " = ? WHERE ID_RATING = ? AND ID_AUTHOR = ?",
        [
        req.body.value,
        req.params.id,
        req.user.username,
        ]
      )
      .then((result) => {
        if (result.affectedRows == 0) res.status(404).send("Id not found");
        else res.status(201).send("Rating updated");
      });
  } catch (err) {
    res.status(500).send(err);
  } finally {
    if (conn) return conn.release();
  }
});

//Generic update Reservations
app.put("/reservation/:id", authenticateJWT, async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    conn
      .query(
        "UPDATE RESERVATIONS SET "+req.body.parameter+ " = ? WHERE ID_RESERVATION = ? AND ID_AUTHOR = ?",
        [
        req.body.value,
        req.params.id,
        req.user.username,
        ]
      )
      .then((result) => {
        if (result.affectedRows == 0) res.status(404).send("Id not found");
        else res.status(201).send("Reservation updated");
      });
  } catch (err) {
    res.status(500).send(err);
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

//Delete establishment by id only if the user is the owner
app.delete("/establishment/:id", authenticateJWT, async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    conn
      .query("DELETE FROM ESTABLISHMENTS WHERE ID_ESTABLISHMENT = ? AND OWNER = ? ", [
        req.params.id,
        req.user.username
      ])
      .then((result) => {
        if (result.affectedRows == 0) res.status(404).send("An establishment by this id not found for this user");
        else res.status(201).send("Establishment deleted successfully");
      });
  } catch (err) {
    res.status(500).send("Error connecting db");
  } finally {
    if (conn) return conn.release();
  }
});

//Delete event by id but only if the user is the venue owner
app.delete("/event/:id", authenticateJWT, async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    conn
      .query("DELETE FROM EVENTS WHERE ID_EVENT = ? AND VENUE_OWNER = ? ", [
        req.params.id,
        req.user.username
      ])
      .then((result) => {
        if (result.affectedRows == 0) res.status(404).send("An event by this id was not found for this user");
        else res.status(201).send("Event deleted successfully");
      });
  } catch (err) {
    res.status(500).send("Error connecting db");
  } finally {
    if (conn) return conn.release();
  }
});

//Delete rating by id but only if the user is the author
app.delete("/rating/:id", authenticateJWT, async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    conn
      .query("DELETE FROM RATINGS WHERE ID_RATING = ? AND ID_AUTHOR = ? ", [
        req.params.id,
        req.user.username
      ])
      .then((result) => {
        if (result.affectedRows == 0) res.status(404).send("A rating by this ID was not found for this user");
        else res.status(201).send("Rating deleted successfully");
      });
  } catch (err) {
    res.status(500).send("Error connecting db");
  } finally {
    if (conn) return conn.release();
  }
});

//Delete reservation by id but only if the user is the author
app.delete("/reservation/:id", authenticateJWT, async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    conn
      .query("DELETE FROM RESERVATIONS WHERE ID_RESERVATION = ? AND ID_AUTHOR = ? ", [
        req.params.id,
        req.user.username
      ])
      .then((result) => {
        if (result.affectedRows == 0) res.status(404).send("A reservation by this ID was not found for this user");
        else res.status(201).send("Reservation deleted successfully");
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

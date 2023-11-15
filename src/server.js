const express = require("express");
const mysql = require("mysql2");
const app = express();
const stripe = require('stripe')('sk_test_51LoS3iSGyKMMAZwstPlmLCEi1eBUy7MsjYxiKsD1lT31LQwvPZYPvqCdfgH9xl8KgeJoVn6EVPMgnMRsFInhnnnb00WhKhMOq7');
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require("jsonwebtoken");
const multer = require("multer");
const { verify } = require("crypto");
const path = require("path");
const PORT = process.env.PORT || 8080;
app.use(express.urlencoded({ extended: true }));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = file.mimetype.startsWith('image/') ? 'public/images' : 'public/videos';
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '_' + Date.now() + ext);
  },
});

const upload = multer({
  storage: storage,
});


app.use(
  cors({
    origin: "*",
    mathod: ["GET", "POST"],
    credentials: true,
  })
);
app.use(express.json());

app.use(cookieParser());

app.use(
  session({
    key: "userId",
    secret: "Englishps4",
    resave: false,
    saveUninitialized: false,
    cookie: {
      expires: 60 * 60 * 24 * 12,
    },
  })
);

app.use(express.static("public"));

const connection = mysql.createPool({
  connectionLimit: 10, // Maximum number of connections in the pool
  host: "localhost",
  user: "root",
  password: "Englishps#4",
  database: "dropment",
});

connection.getConnection((err) => {
  if (err) {
    console.error("Error connecting to MySQL database: ", err);
  } else {
    console.log("Connected to MySQL database");
  }
});

app.get("/", (req, res) => {
  res.send("error!!");
});

app.get("/products/product", (req, res) => {
  const sqlget = "SELECT * FROM products";

  connection.query(sqlget, (err, results) => {
    if (err) {
      console.error("Error fetching data from MySQL: ", err);
      res.status(500).json({ error: "Error fetching data from MySQL" });
    } else {
      res.send({ items: results });
    }
  });
});

app.get("/users", (req, res) => {
  const token = req.headers.authorization;
  const sqlget = `SELECT * FROM users where jwt = '${token}'`;

  connection.query(sqlget, (err, results) => {
    if (err) {
      console.error("Error fetching data from MySQL: ", err);
      res.status(500).json({ error: "Error fetching data from MySQL" });
    } else {
      res.send({ user: results });
    }
  });
});

app.post("/addProduct", upload.single("image"), (req, res) => {
  const id = req.body.id;
  const title = req.body.title;
  const price = req.body.price;
  const amount = req.body.amount;
  const payment = req.body.payment;
  const product_description = req.body.product_description;
  const usd = req.body.usd;
  const EUR = req.body.EUR;
  const GBP = req.body.GBP;
  const JPY = req.body.JPY;
  const CAD = req.body.CAD;
  const AUD = req.body.AUD;
  const CHF = req.body.CHF;
  const CNY = req.body.CNY;
  const INR = req.body.INR;
  const BRL = req.body.BRL;
  const RUB = req.body.RUB;
  const KRW = req.body.KRW;
  const SGD = req.body.SGD;
  const NZD = req.body.NZD;
  const MXN = req.body.MXN;
  const HKD = req.body.HKD;
  const TRY = req.body.TRY;
  const ZAR = req.body.ZAR;
  const SEK = req.body.SEK;
  const NOK = req.body.NOK;
  
  const token = req.headers.authorization;
  const image = req.file.filename;

  const selectQuery = `SELECT shop_id FROM shops WHERE shop_id = '${token}'`;
  const insertQuery =
    "INSERT INTO products (title, price, amount, shop_id, images, payment, product_description,  usd, EUR, GBP, JPY, CAD, AUD, CHF, CNY, INR, BRL, RUB, KRW, SGD, NZD, MXN, HKD, TRY, ZAR, SEK, NOK) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

  // Execute the first query to fetch the shop_id
  connection.query(selectQuery, (err, rows) => {
    if (err) {
      console.error("Error fetching shop_id:", err);
      res.status(500).send("Error adding product.");
      return;
    }

    if (rows.length === 0) {
      console.error("Shop not found.");
      res.status(404).send("Shop not found.");
      return;
    }

    const shop_id = rows[0].shop_id;

    // Execute the second query to insert the product details
    connection.query(
      insertQuery,
      [title, price, amount, shop_id, image, payment, product_description, usd, EUR, GBP, JPY, CAD, AUD, CHF, CNY, INR, BRL, RUB, KRW, SGD, NZD, MXN, HKD, TRY, ZAR, SEK, NOK],
      (err, result) => {
        if (err) {
          console.error("Error inserting product:", err);
          res.status(500).send("Error adding product.");
          return;
        }

        console.log("Product added successfully!");
        res.status(200).send("Product added successfully!");
      }
    );
  });
});
app.post("/addShops", upload.single("image"), (req, res) => {
  const shop_name = req.body.shop_name;
  const shop_owner = req.body.shop_owner;
  const shop_about = req.body.shop_about;
  const shop_prods = req.body.shop_prods;
  const temp1 = req.body.temp1;
  const token = req.headers.authorization;
  const selectQuery = `SELECT user_id FROM users WHERE jwt = '${token}' `;
  const insertQuery =
    "INSERT INTO shops(shop_name, temp1, shop_owner, shop_about, shop_prods, user_id) VALUES (?, ?, ?, ?, ?, ?)";

  // Execute the first query to fetch users
  const fetchUsersPromise = new Promise((resolve, reject) => {
    connection.query(selectQuery, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

  // Chain the promises to insert the shop details after fetching the users
  fetchUsersPromise
    .then((rows) => {
      // Assuming you have a specific user in mind to retrieve the userId
      const user_id = rows[0].user_id;
      // Execute the second query to insert shop details
      return new Promise((resolve, reject) => {
        connection.query(
          insertQuery,
          [
            shop_name,
            temp1,
            shop_owner,
            shop_about,
            shop_prods,
            user_id
          ],
          (err, result) => {
            if (err) reject(err);
            else resolve(result);
          }
        );
      });
    })
    .then((result) => {
      console.log(result);
      res.status(200).send("Shop added successfully!");
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error adding shop.");
    });
});
app.post("/addUser", (req, res) => {
  const {
    phoneno,
    email,
    password,
    first_name,
    last_name,
    streetadrs,
    city,
    state,
    zipcode,
    country,
    occupation,
    age,
    unique_id,
    bio
  } = req.body;

  // Hash the password
  bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) {
      console.error("Error hashing password: ", err);
      res.status(500).json({ error: "Internal server error" });
    } else {
      // Insert the user into the database
      const query =
        "INSERT INTO users (first_name, last_name, email, password, unique_id, occupation, age, phoneno, streetadrs, city, state, zipcode, country, bio) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
      const values = [
        first_name,
        last_name,
        email,
        hash,
        unique_id,
        occupation,
        age,
        phoneno,
        streetadrs,
        city,
        state,
        zipcode,
        country,
        bio
      ];

      connection.query(query, values, (error, results) => {
        if (error) {
          console.error("Error inserting user: ", error);
          res.status(500).json({ error: "Internal server error" });
        } else {
          console.log("User registration successful!");
          res.sendStatus(200);
        }
      });
    }
  });
});

app.get("/use/shops", (req, res) => {
  const token = req.headers.authorization;
  const selectQuery = `SELECT user_id FROM users WHERE jwt = '${token}' `;
  const insertQuery = "SELECT * FROM shops where user_id = ?";

  // Execute the first query to fetch users
  const fetchUsersPromise = new Promise((resolve, reject) => {
    connection.query(selectQuery, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

  // Chain the promises to insert the shop details after fetching the users
  fetchUsersPromise
    .then((rows) => {
      // Assuming you have a specific user in mind to retrieve the userId
      const user_id = rows[0].user_id;

      return new Promise((resolve, reject) => {
        const shopsquary = `select * from shops where user_id = '${user_id}'`;
        connection.query(shopsquary, (err, result) => {
          if (err) reject(err);
          else resolve;
          res.send({ shops: result });
        });
      });
    })
    .then((result) => {
      res.send({ shops: result });
    })
    .catch((err) => {
      console.error(err);
    });
});

app.get("/use/shops/products", (req, res) => {
  const token = req.headers.authorization;
  const selectQuery = `SELECT shop_id FROM shops WHERE shop_id = '${token}' `;
  const insertQuery = "SELECT * FROM products where shop_id = ?";

  // Execute the first query to fetch users
  const fetchUsersPromise = new Promise((resolve, reject) => {
    connection.query(selectQuery, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

  // Chain the promises to insert the shop details after fetching the users
  fetchUsersPromise
    .then((rows) => {
      // Assuming you have a specific user in mind to retrieve the userId
      const shop_id = rows[0].shop_id;

      return new Promise((resolve, reject) => {
        const shopsquary = `select * from products where shop_id = '${shop_id}'`;
        connection.query(shopsquary, (err, result) => {
          if (err) reject(err);
          else resolve;
          res.send({ items: result });
        });
      });
    })
    .then((result) => {
      res.send({ items: result });
    })
    .catch((err) => {
      console.error(err);
    });
});

app.get("/users/profile/shops", (req, res) => {
  const token = req.headers.authorization;
  const sqlget = `SELECT * FROM shops`
  connection.query(sqlget, (err, results) => {
    if (err) {
      console.error("Error fetching data from MySQL: ", err);
      res.status(500).json({ error: "Error fetching data from MySQL" });
    } else {
      res.send({ shops: results });
    }
  });
});

const verifyjwt = (req, res) => {
  const token = req.headers["x-access-token"];

  if (!token) {
    res.send("no token unsuccessfull");
  } else {
    jwt.verify(token, "jwtsecret", (err, decoded) => {
      if (err) {
        res.json({ auth: false, message: "u have failed to auth" });
      } else {
        req.user_id = decoded.id;
      }
    });
  }
};

app.get("/userAuth", verifyjwt, (req, res) => {});

app.get("/login", (req, res) => {
  if (req.session.user) {
    res.send({ loggedIn: true, user: req.session.user });
  } else {
    res.send({ loggedIn: false });
  }
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  connection.query(
    "SELECT * FROM users WHERE email = ?",
    email,
    (err, result) => {
      if (err) {
        res.send({ err: err });
      }
      if (result.length > 0) {
        bcrypt.compare(password, result[0].password, (error, response) => {
          if (response) {
            const id = result[0].id;
            const token = jwt.sign({ id }, "jwtsecret", {
              expiresIn: 86400,
            });

            connection.query(
              `update users set jwt = "${token}" where email = "${email}" `,
              (err, result) => {
                if (err) console.log(err);
                console.log(result);
              }
            );
            req.session.user = result;
            res.json({ auth: true, token: token, result: result });
          } else {
            res.json({ auth: false, message: "Email or password is wrong" });
          }
        });
      } else {
        res.json({ auth: false, message: "User does not exist" });
      }
    }
  );
});

app.get("/Productlandingpage", (req, res) => {
  const sqlget = "SELECT * FROM products where id = 5";

  connection.query(sqlget, (err, results) => {
    if (err) {
      console.error("Error fetching data from MySQL: ", err);
      res.status(500).json({ error: "Error fetching data from MySQL" });
    } else {
      res.send({ items: results });
    }
  });
});
app.get("/profile", (req, res) => {
  const userId = req.headers.authorization;
  const query = "SELECT * FROM users WHERE user_id = 1";

  connection.query(query, (error, results) => {
    if (error) {
      console.error(error);
      return res.status(500).send("Error retrieving user data");
    }

    const user = results[0];
    res.send({ user });
  });
});

app.get("/user", verifyjwt, (req, res) => {
  const userId = req.headers.authorization;

  connection.query(
    `SELECT * FROM users WHERE jwt = ?`,
    [userId],

    (err, results) => {
      if (err) {
        console.error("Error retrieving user information:", err);
        res.status(500).json({ error: "An error occurred" });
        return;
      }

      if (results.length === 0) {
        res.status(404).json({ error: "User not found" });
        return;
      }
      const user = results[0];
      res.json({ user: user });
    }
  );
});

app.get("/user/shops/fashion", (req, res) => {
  const token = req.headers.authorization;
  const selectQuery = `SELECT user_id FROM users WHERE jwt = '${token}' `;
  const insertQuery = "SELECT * FROM shops where user_id = ?";

  // Execute the first query to fetch users
  const fetchUsersPromise = new Promise((resolve, reject) => {
    connection.query(selectQuery, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

  // Chain the promises to insert the shop details after fetching the users
  fetchUsersPromise
    .then((rows) => {
      // Assuming you have a specific user in mind to retrieve the userId
      const user_id = rows[0].user_id;

      return new Promise((resolve, reject) => {
        const shopsquary = `select * from shops where user_id = '${user_id}'`;
        connection.query(shopsquary, (err, result) => {
          if (err) reject(err);
          else resolve;
          res.send({ shops: result });
        });
      });
    })
    .then((result) => {
      res.send({ shops: result });
    })
    .catch((err) => {
      console.error(err);
    });
});

app.get("/user/shops/fashion/preview", (req, res) => {
  const sqlget = "SELECT * FROM fashionshop where id = ";

  connection.query(sqlget, (err, results) => {
    if (err) {
      console.error("Error fetching data from MySQL: ", err);
      res.status(500).json({ error: "Error fetching data from MySQL" });
    } else {
      res.send({ shops: results });
    }
  });
});


app.get("/myorders", (req, res) => {
  const token = req.headers.authorization;
  const selectQuery = `SELECT shop_id FROM shops WHERE shop_id = '${token}' `;
  const insertQuery = "SELECT * FROM orders where shop_id = ?";

  // Execute the first query to fetch users
  const fetchUsersPromise = new Promise((resolve, reject) => {
    connection.query(selectQuery, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

  // Chain the promises to insert the shop details after fetching the users
  fetchUsersPromise
    .then((rows) => {
      // Assuming you have a specific user in mind to retrieve the userId
      const shop_id = rows[0].shop_id;

      return new Promise((resolve, reject) => {
        const shopsquary = `select * from orders where shop_id = '${shop_id}'`;
        connection.query(shopsquary, (err, result) => {
          if (err) reject(err);
          else resolve;
          res.send({ sales: result });
        });
      });
    })
    .then((result) => {
      res.send({ sales: result });
    })
    .catch((err) => {
      console.error(err);
    });
});

app.get("/allorders", (req, res) => {
  const sqlget = "SELECT * FROM orders";

  connection.query(sqlget, (err, results) => {
    if (err) {
      console.error("Error fetching data from MySQL: ", err);
      res.status(500).json({ error: "Error fetching data from MySQL" });
    } else {
      res.send({ shops: results });
    }
  });
});

app.post("/sendmessage", (req, res) => {
  const message = req.body.message;
  const token = req.headers.authorization;
  const selectQuery = `SELECT orders_id FROM orders WHERE orders_id = '${token}' `;
  const insertQuery = "INSERT INTO chat(orders_id, message) VALUES (?, ?)";

  // Execute the first query to fetch users
  const fetchUsersPromise = new Promise((resolve, reject) => {
    connection.query(selectQuery, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

  // Chain the promises to insert the shop details after fetching the users
  fetchUsersPromise
    .then((rows) => {
      // Assuming you have a specific user in mind to retrieve the userId
      const orders_id = rows[0].orders_id;
      // Execute the second query to insert shop details
      return new Promise((resolve, reject) => {
        connection.query(insertQuery, [orders_id, message], (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      });
    })
    .then((result) => {
      console.log(result);
      res.status(200).send("Shop added successfully!");
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error adding shop.");
    });
});

app.get("/message", (req, res) => {
  const token = req.headers.authorization;
  const selectQuery = `SELECT orders_id FROM orders WHERE orders_id = '${token}' `;
  const insertQuery = "SELECT * FROM orders where shop_id = ?";

  // Execute the first query to fetch users
  const fetchUsersPromise = new Promise((resolve, reject) => {
    connection.query(selectQuery, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

  // Chain the promises to insert the shop details after fetching the users
  fetchUsersPromise
    .then((rows) => {
      // Assuming you have a specific user in mind to retrieve the userId
      const shop_id = rows[0].orders_id;

      return new Promise((resolve, reject) => {
        const shopsquary = `select * from chat where orders_id = '${shop_id}'`;
        connection.query(shopsquary, (err, result) => {
          if (err) reject(err);
          else resolve;
          res.send({ chat: result })
        });
      });
    })
    .then((result) => {
      res.send({ chat: result });
    })
    .catch((err) => {
      console.error(err);
    });
});

app.get("/user/orders", (req, res) => {
  const token = req.headers.authorization;
  const selectQuery = `SELECT user_id FROM users WHERE jwt = '${token}' `;
  const insertQuery = "SELECT * FROM orders where shop_id = ?";

  // Execute the first query to fetch users
  const fetchUsersPromise = new Promise((resolve, reject) => {
    connection.query(selectQuery, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

  // Chain the promises to insert the shop details after fetching the users
  fetchUsersPromise
    .then((rows) => {
      // Assuming you have a specific user in mind to retrieve the userId
      const user_id = rows[0].user_id;

      return new Promise((resolve, reject) => {
        const shopsquary = `select * from orders where sender_id = '${user_id}'`;
        connection.query(shopsquary, (err, result) => {
          if (err) reject(err);
          else resolve;
          res.send({ orders: result });
        });
      });
    })
    .then((result) => {
      res.send({ orders: result });
    })
    .catch((err) => {
      console.error(err);
    });
});


app.get("/user/id/editbtndiaplay1", (req, res) => {
  const token = req.headers.authorization;
  const selectQuery = `SELECT user_id FROM shops WHERE shop_id = '${token}'`;

  // Execute the query to fetch the user_id
  connection.query(selectQuery, (err, rows) => {
    if (err) {
      console.error(err);
      res.status(500).send("Internal Server Error");
    } else {
      if (rows.length === 0) {
        res.status(404).send("User not found");
      } else {
        const user_id = rows[0].user_id;
        const shopsQuery = `SELECT * FROM users WHERE user_id = '${user_id}'`;

        // Execute the query to fetch the user details
        connection.query(shopsQuery, (err, result) => {
          if (err) {
            console.error(err);
            res.status(500).send("Internal Server Error");
          } else {
            res.send({ shops: result });
          }
        });
      }
    }
  });
});

app.get("/user/id/editbtndiaplay2", (req, res) => {
  const token = req.headers.authorization;
  const selectQuery = `SELECT user_id FROM users WHERE jwt = '${token}'`;

  // Execute the query to fetch the user_id
  connection.query(selectQuery, (err, rows) => {
    if (err) {
      console.error(err);
      res.status(500).send("Internal Server Error");
    } else {
      if (rows.length === 0) {
        res.status(404).send("User not found");
      } else {
        const user_id = rows[0].user_id;
        const shopsQuery = `SELECT * FROM users WHERE user_id = '${user_id}'`;

        // Execute the query to fetch the user details
        connection.query(shopsQuery, (err, result) => {
          if (err) {
            console.error(err);
            res.status(500).send("Internal Server Error");
          } else {
            res.send({ user: result });
          }
        });
      }
    }
  });
});

app.put("/updateprods", (req, res) => {
  const id = req.headers.authorization;
  const { title, price, amount } = req.body;

  const sql = `UPDATE products SET title = ?, price = ?, amount = ? WHERE id = ?`;
  const values = [title, price, amount, id];

  connection.query(sql, values, (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).json({ message: "Error updating product." });
    } else {
      res.json({ message: "Product updated successfully." });
    }
  });
});

app.put("/updateshop1", (req, res) => {
  const id = req.headers.authorization;
  const {
    shop_name,
    shop_owner,
    shop_about,
    shop_prods,
    shop_tagline,
    shop_abouthead,
    shop_block2,
    shop_block3,
    shop_blockhead2,
    shop_blockhead3,
    shop_blockhead1,
    shop_block1,
    shop_keyhead1,
    shop_key1,
    shop_keyhead2,
    shop_key2,
    shop_keyhead3,
    shop_key3,
    shop_email,
    shop_phone,
  } = req.body;

  const sql = `UPDATE shops SET shop_name = ?, shop_owner = ?, shop_about = ?, shop_prods = ?, shop_tagline = ?, shop_abouthead = ?, shop_blockhead2 = ?, shop_block2 = ?, shop_blockhead3 = ?, shop_block3 = ?, shop_blockhead1 = ?, shop_block1 = ?, shop_keyhead1 = ?, shop_key1 = ?, shop_keyhead2 = ?, shop_key2 = ?, shop_keyhead3 = ?, shop_key3 = ?, shop_email = ?, shop_phone= ? WHERE shop_id = ?`;
  const values = [
    shop_name,
    shop_owner,
    shop_about,
    shop_prods,
    shop_tagline,
    shop_abouthead,
    shop_block2,
    shop_block3,
    shop_blockhead2,
    shop_blockhead3,
    shop_blockhead1,
    shop_block1,
    shop_keyhead1,
    shop_key1,
    shop_keyhead2,
    shop_key2,
    shop_keyhead3,
    shop_key3,
    shop_email,
    shop_phone,
    id,
  ];

  connection.query(sql, values, (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).json({ message: "Error updating product." });
    } else {
      res.json({ message: "Product updated successfully." });
    }
  });
});

app.get("/user/id/editbtnstoredisplay1", (req, res) => {
  const token = req.headers.authorization;
  const selectQuery = `SELECT user_id FROM shops WHERE shop_id = '${token}'`;

  // Execute the query to fetch the user_id
  connection.query(selectQuery, (err, rows) => {
    if (err) {
      console.error(err);
      res.status(500).send("Internal Server Error");
    } else {
      if (rows.length === 0) {
        res.status(404).send("User not found");
      } else {
        const user_id = rows[0].user_id;
        const shopsQuery = `SELECT user_id FROM shops WHERE user_id = '${user_id}'`;

        // Execute the query to fetch the user details
        connection.query(shopsQuery, (err, result) => {
          if (err) {
            console.error(err);
            res.status(500).send("Internal Server Error");
          } else {
            res.send({ shops: result });
          }
        });
      }
    }
  });
});

app.get("/user/id/editbtndiaplay2", (req, res) => {
  const token = req.headers.authorization;
  const selectQuery = `SELECT user_id FROM users WHERE jwt = '${token}'`;

  // Execute the query to fetch the user_id
  connection.query(selectQuery, (err, rows) => {
    if (err) {
      console.error(err);
      res.status(500).send("Internal Server Error");
    } else {
      if (rows.length === 0) {
        res.status(404).send("User not found");
      } else {
        const user_id = rows[0].user_id;
        const shopsQuery = `SELECT * FROM users WHERE user_id = '${user_id}'`;

        // Execute the query to fetch the user details
        connection.query(shopsQuery, (err, result) => {
          if (err) {
            console.error(err);
            res.status(500).send("Internal Server Error");
          } else {
            res.send({ user: result });
          }
        });
      }
    }
  });
});
app.get("/imgprods", (req, res) => {
  const id = req.headers.authorization;
  const selectQuery = `SELECT id FROM products WHERE id = '${id}' `;
  const insertQuery = "SELECT * FROM products where id = ?";

  // Execute the first query to fetch users
  const fetchUsersPromise = new Promise((resolve, reject) => {
    connection.query(selectQuery, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

  // Chain the promises to insert the shop details after fetching the users
  fetchUsersPromise
    .then((rows) => {
      // Assuming you have a specific user in mind to retrieve the userId
      const id = rows[0].id;

      return new Promise((resolve, reject) => {
        const shopsquary = `select * from products where id = '${id}'`;
        connection.query(shopsquary, (err, result) => {
          if (err) reject(err);
          else resolve;
          res.send({ img: result });
        });
      });
    })
    .then((result) => {
      res.send({ img: result });
    })
    .catch((err) => {
      console.error(err);
    });
});

app.get("/api/search", (req, res) => {
  const { query } = req.query;
  const searchTerm = `%${query}%`;

  const searchQuery =
    "SELECT * FROM products WHERE title LIKE ? OR price LIKE ?";
  connection.query(searchQuery, [searchTerm, searchTerm], (err, results) => {
    if (err) {
      console.error("Error executing product search query:", err);
      res.status(500).json({ error: "Error executing product search query" });
    } else {
      res.status(200).json(results);
    }
  });
});

// Search route for users
app.get("/api/user/search", (req, res) => {
  const { query } = req.query;
  const searchTerm = `%${query}%`;

  const searchQuery =
    "SELECT * FROM users WHERE first_name LIKE ? OR last_name LIKE ?";
  connection.query(searchQuery, [searchTerm, searchTerm], (err, results) => {
    if (err) {
      console.error("Error executing user search query:", err);
      res.status(500).json({ error: "Error executing user search query" });
    } else {
      res.status(200).json(results);
    }
  });
});

app.get("/api/shops/search", (req, res) => {
  const { query } = req.query;
  const searchTerm = `%${query}%`;

  const searchQuery =
    "SELECT * FROM shops WHERE shop_name LIKE ? OR shop_owner LIKE ?";
  connection.query(searchQuery, [searchTerm, searchTerm], (err, results) => {
    if (err) {
      console.error("Error executing user search query:", err);
      res.status(500).json({ error: "Error executing user search query" });
    } else {
      res.status(200).json(results);
    }
  });
});
app.post("/addShops/template4", (req, res) => {
  const {
    shop_name,
    shop_owner,
    shop_blockhead1,
    shop_blockhead2,
    shop_keyhead1,
    shop_key1,
    shop_email,
    shop_phone,
    insta,
    temp4,
    shop_blockhead3,
    shop_block1,
    shop_block2,
    shop_block3
  } = req.body;
  const token = req.headers.authorization;
  const selectQuery = `SELECT user_id FROM users WHERE jwt = '${token}' `;
  const insertQuery =
    "INSERT INTO shops(shop_name, insta, temp, shop_keyhead1, shop_key1, shop_blockhead1, shop_blockhead2, shop_email, shop_phone, user_id, shop_owner, shop_block1, shop_block2, shop_block3, shop_blockhead3) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";

  connection.query(selectQuery, (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error fetching user.");
    }

    if (rows.length === 0) {
      return res.status(401).send("Unauthorized user.");
    }

    const user_id = rows[0].user_id;

    connection.query(
      insertQuery,
      [
        shop_name,
        insta,
        temp4,
        shop_keyhead1,
        shop_key1,
        shop_blockhead1,
        shop_blockhead2,
        shop_email,
        shop_phone,
        user_id,
        shop_owner,
        shop_block1,
        shop_block2,
        shop_block3,
        shop_blockhead3
      ],
      (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).send("Error adding shop.");
        }

        console.log(result);
        return res.status(200).send("Shop added successfully!");
      }
    );
  });
});

app.get("/user/shops/template4", (req, res) => {
  const token = req.headers.authorization;
  const selectQuery = `SELECT user_id FROM users WHERE jwt = '${token}' `;
  const insertQuery = "SELECT * FROM shops where user_id = ?";

  // Execute the first query to fetch users
  const fetchUsersPromise = new Promise((resolve, reject) => {
    connection.query(selectQuery, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

  // Chain the promises to insert the shop details after fetching the users
  fetchUsersPromise
    .then((rows) => {
      // Assuming you have a specific user in mind to retrieve the userId
      const user_id = rows[0].user_id;

      return new Promise((resolve, reject) => {
        const shopsquary = `select * from shops where user_id = '${user_id}'`;
        connection.query(shopsquary, (err, result) => {
          if (err) reject(err);
          else resolve;
          res.send({ shops: result });
        });
      });
    })
    .then((result) => {
      res.send({ shops: result });
    })
    .catch((err) => {
      console.error(err);
    });
});

app.get("/user/template4", (req, res) => {
  const token = req.headers.authorization;
  const selectQuery = `SELECT user_id FROM users WHERE user_id = '${token}' `;
  const insertQuery = "SELECT * FROM shops where user_id = ?";

  // Execute the first query to fetch users
  const fetchUsersPromise = new Promise((resolve, reject) => {
    connection.query(selectQuery, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

  // Chain the promises to insert the shop details after fetching the users
  fetchUsersPromise
    .then((rows) => {
      // Assuming you have a specific user in mind to retrieve the userId
      const user_id = rows[0].user_id;

      return new Promise((resolve, reject) => {
        const shopsquary = `select * from shops where user_id = '${user_id}'`;
        connection.query(shopsquary, (err, result) => {
          if (err) reject(err);
          else resolve;
          res.send({ shops: result });
        });
      });
    })
    .then((result) => {
      res.send({ shops: result });
    })
    .catch((err) => {
      console.error(err);
    });
});

app.post("/addShops/template5", (req, res) => {
  const {
    shop_name,
    shop_owner,
    shop_blockhead1,
    shop_block1,
    shop_blockhead2,
    shop_block2,
    shop_blockhead3,
    shop_block3,
    shop_keyhead1,
    shop_key1,
    shop_email,
    shop_phone,
    insta,
    temp5,
    uniqueIdentifier
  } = req.body;
  const token = req.headers.authorization;
  const selectQuery = `SELECT user_id FROM users WHERE jwt = '${token}' `;
  const insertQuery =
    "INSERT INTO shops(shop_name, shop_email, insta, shop_keyhead1, shop_blockhead3, shop_blockhead1, shop_key1, shop_blockhead2, shop_phone, user_id, shop_owner, shop_block1, shop_block2, temp, shop_block3, uniqueIdentifier) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";

  connection.query(selectQuery, (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error fetching user.");
    }

    if (rows.length === 0) {
      return res.status(401).send("Unauthorized user.");
    }

    const user_id = rows[0].user_id;

    connection.query(
      insertQuery,
      [
        shop_name,
        shop_email,
        insta,   
        shop_keyhead1,
        shop_blockhead3,
        shop_blockhead1,
        shop_key1,
        shop_blockhead2,
        shop_phone,
        user_id,
        shop_owner,
        shop_block1,
        shop_block2,
        temp5,
        shop_block3, 
        uniqueIdentifier,
      ],
      (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).send("Error adding shop.");
        }

        console.log(result);
        return res.status(200).send("Shop added successfully!");
      }
    );
  });
});

app.get("/user/shops/template5", (req, res) => {
  const token = req.headers.authorization;
  const selectQuery = `SELECT user_id FROM users WHERE jwt = '${token}' `;
  const insertQuery = "SELECT * FROM shops where user_id = ?";

  // Execute the first query to fetch users
  const fetchUsersPromise = new Promise((resolve, reject) => {
    connection.query(selectQuery, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

  // Chain the promises to insert the shop details after fetching the users
  fetchUsersPromise
    .then((rows) => {
      // Assuming you have a specific user in mind to retrieve the userId
      const user_id = rows[0].user_id;

      return new Promise((resolve, reject) => {
        const shopsquary = `select * from shops where user_id = '${user_id}'`;
        connection.query(shopsquary, (err, result) => {
          if (err) reject(err);
          else resolve;
          res.send({ shops: result });
        });
      });
    })
    .then((result) => {
      res.send({ shops: result });
    })
    .catch((err) => {
      console.error(err);
    });
});

app.get("/user/template5", (req, res) => {
  const token = req.headers.authorization;
  const selectQuery = `SELECT user_id FROM users WHERE user_id = '${token}' `;
  const insertQuery = "SELECT * FROM shops where user_id = ?";

  // Execute the first query to fetch users
  const fetchUsersPromise = new Promise((resolve, reject) => {
    connection.query(selectQuery, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

  // Chain the promises to insert the shop details after fetching the users
  fetchUsersPromise
    .then((rows) => {
      // Assuming you have a specific user in mind to retrieve the userId
      const user_id = rows[0].user_id;

      return new Promise((resolve, reject) => {
        const shopsquary = `select * from shops where user_id = '${user_id}'`;
        connection.query(shopsquary, (err, result) => {
          if (err) reject(err);
          else resolve;
          res.send({ shops: result });
        });
      });
    })
    .then((result) => {
      res.send({ shops: result });
    })
    .catch((err) => {
      console.error(err);
    });
});

app.post("/addShops/template6", (req, res) => {
  const {
    shop_name,
    shop_owner,
    shop_blockhead1,
    shop_block1,
    shop_blockhead2,
    shop_block2,
    shop_blockhead3,
    shop_block3,
    shop_keyhead1,
    shop_key1,
    shop_keyhead2,
    shop_key2,
    shop_email,
    shop_phone,
    insta,
    salestext,
    temp6,
    shop_tagline,
    uniqueIdentifier
  } = req.body;
  const token = req.headers.authorization;
  const selectQuery = `SELECT user_id FROM users WHERE jwt = '${token}' `;
  const insertQuery =
    "INSERT INTO shops(shop_name, insta, salestext, temp, shop_keyhead1, shop_key1, shop_keyhead2, shop_key2, shop_blockhead1, shop_blockhead2, shop_email, shop_phone, user_id, shop_owner, shop_block1, shop_block2, shop_blockhead3, shop_block3, shop_tagline, uniqueIdentifier) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";

  connection.query(selectQuery, (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error fetching user.");
    }

    if (rows.length === 0) {
      return res.status(401).send("Unauthorized user.");
    }

    const user_id = rows[0].user_id;

    connection.query(
      insertQuery,
      [
        shop_name,
        insta,
        salestext,
        temp6,
        shop_keyhead1,
        shop_key1,
        shop_keyhead2,
        shop_key2,
        shop_blockhead1,
        shop_blockhead2,
        shop_email,
        shop_phone,
        user_id,
        shop_owner,
        shop_block1,
        shop_block2,
        shop_blockhead3,
        shop_block3,
        shop_tagline,
        uniqueIdentifier
      ],
      (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).send("Error adding shop.");
        }

        console.log(result);
        return res.status(200).send("Shop added successfully!");
      }
    );
  });
});

app.get("/user/shops/fashion", (req, res) => {
  const token = req.headers.authorization;
  const selectQuery = `SELECT user_id FROM users WHERE jwt = '${token}' `;
  const insertQuery = "SELECT * FROM shops where user_id = ?";

  // Execute the first query to fetch users
  const fetchUsersPromise = new Promise((resolve, reject) => {
    connection.query(selectQuery, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

  // Chain the promises to insert the shop details after fetching the users
  fetchUsersPromise
    .then((rows) => {
      // Assuming you have a specific user in mind to retrieve the userId
      const user_id = rows[0].user_id;

      return new Promise((resolve, reject) => {
        const shopsquary = `select * from shops where user_id = '${user_id}'`;
        connection.query(shopsquary, (err, result) => {
          if (err) reject(err);
          else resolve;
          res.send({ shops: result });
        });
      });
    })
    .then((result) => {
      res.send({ shops: result });
    })
    .catch((err) => {
      console.error(err);
    });
});

app.get("/user/shops/template6", (req, res) => {
  const token = req.headers.authorization;
  const selectQuery = `SELECT user_id FROM users WHERE jwt = '${token}' `;
  const insertQuery = "SELECT * FROM shops where user_id = ?";

  // Execute the first query to fetch users
  const fetchUsersPromise = new Promise((resolve, reject) => {
    connection.query(selectQuery, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

  // Chain the promises to insert the shop details after fetching the users
  fetchUsersPromise
    .then((rows) => {
      // Assuming you have a specific user in mind to retrieve the userId
      const user_id = rows[0].user_id;

      return new Promise((resolve, reject) => {
        const shopsquary = `select * from shops where user_id = '${user_id}'`;
        connection.query(shopsquary, (err, result) => {
          if (err) reject(err);
          else resolve;
          res.send({ shops: result });
        });
      });
    })
    .then((result) => {
      res.send({ shops: result });
    })
    .catch((err) => {
      console.error(err);
    });
  });

  app.get("/user/shops/template6", (req, res) => {
  const token = req.headers.authorization;
  const selectQuery = `SELECT user_id FROM users WHERE jwt = '${token}' `;
  const insertQuery = "SELECT * FROM shops where user_id = ?";

  // Execute the first query to fetch users
  const fetchUsersPromise = new Promise((resolve, reject) => {
    connection.query(selectQuery, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

  // Chain the promises to insert the shop details after fetching the users
  fetchUsersPromise
    .then((rows) => {
      // Assuming you have a specific user in mind to retrieve the userId
      const user_id = rows[0].user_id;

      return new Promise((resolve, reject) => {
        const shopsquary = `select * from shops where user_id = '${user_id}'`;
        connection.query(shopsquary, (err, result) => {
          if (err) reject(err);
          else resolve;
          res.send({ shops: result });
        });
      });
    })
    .then((result) => {
      res.send({ shops: result });
    })
    .catch((err) => {
      console.error(err);
    });
});

app.get("/user/template6", (req, res) => {
  const token = req.headers.authorization;
  const selectQuery = `SELECT user_id FROM users WHERE user_id = '${token}' `;
  const insertQuery = "SELECT * FROM shops where user_id = ?";

  // Execute the first query to fetch users
  const fetchUsersPromise = new Promise((resolve, reject) => {
    connection.query(selectQuery, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

  // Chain the promises to insert the shop details after fetching the users
  fetchUsersPromise
    .then((rows) => {
      // Assuming you have a specific user in mind to retrieve the userId
      const user_id = rows[0].user_id;

      return new Promise((resolve, reject) => {
        const shopsquary = `select * from shops where user_id = '${user_id}'`;
        connection.query(shopsquary, (err, result) => {
          if (err) reject(err);
          else resolve;
          res.send({ shops: result });
        });
      });
    })
    .then((result) => {
      res.send({ shops: result });
    })
    .catch((err) => {
      console.error(err);
    });
});


app.post("/addShops/template1", (req, res) => {
  const {
    shop_name,
    shop_owner,
    shop_blockhead1,
    shop_block1,
    shop_blockhead2,
    shop_block2,
    shop_blockhead3,
    shop_block3,
    shop_keyhead1,
    shop_key1,
    shop_keyhead2,
    shop_key2,
    shop_email,
    shop_phone,
    insta,
    shop_keyhead3,
    shop_key3,
    salestext,
    temp1,
    shop_tagline,
    uniqueIdentifier
  } = req.body;
  const token = req.headers.authorization;
  const selectQuery = `SELECT user_id FROM users WHERE jwt = '${token}' `;
  const insertQuery =
    "INSERT INTO shops(shop_name,shop_keyhead3, shop_key3, insta, salestext, temp, shop_keyhead1, shop_key1, shop_keyhead2, shop_key2, shop_blockhead1, shop_blockhead2, shop_email, shop_phone, user_id, shop_owner, shop_block1, shop_block2, shop_blockhead3, shop_block3, shop_tagline, uniqueIdentifier) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";

  connection.query(selectQuery, (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error fetching user.");
    }

    if (rows.length === 0) {
      return res.status(401).send("Unauthorized user.");
    }

    const user_id = rows[0].user_id;

    connection.query(
      insertQuery,
      [
        shop_name,
        shop_keyhead3,
        shop_key3,
        insta,
        salestext,
        temp1,
        shop_keyhead1,
        shop_key1,
        shop_keyhead2,
        shop_key2,
        shop_blockhead1,
        shop_blockhead2,
        shop_email,
        shop_phone,
        user_id,
        shop_owner,
        shop_block1,
        shop_block2,
        shop_blockhead3,
        shop_block3,
        shop_tagline,
        uniqueIdentifier
      ],
      (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).send("Error adding shop.");
        }

        console.log(result);
        return res.status(200).send("Shop added successfully!");
      }
    );
  });
});

app.get("/user/shops/template1", (req, res) => {
  const token = req.headers.authorization;
  const selectQuery = `SELECT user_id FROM users WHERE jwt = '${token}' `;
  const insertQuery = "SELECT * FROM shops where user_id = ?";

  // Execute the first query to fetch users
  const fetchUsersPromise = new Promise((resolve, reject) => {
    connection.query(selectQuery, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

  // Chain the promises to insert the shop details after fetching the users
  fetchUsersPromise
    .then((rows) => {
      // Assuming you have a specific user in mind to retrieve the userId
      const user_id = rows[0].user_id;

      return new Promise((resolve, reject) => {
        const shopsquary = `select * from shops where user_id = '${user_id}'`;
        connection.query(shopsquary, (err, result) => {
          if (err) reject(err);
          else resolve;
          res.send({ shops: result });
        });
      });
    })
    .then((result) => {
      res.send({ shops: result });
    })
    .catch((err) => {
      console.error(err);
    });
});

app.get("/user/template1", (req, res) => {
  const token = req.headers.authorization;
  const selectQuery = `SELECT user_id FROM users WHERE user_id = '${token}' `;
  const insertQuery = "SELECT * FROM shops where user_id = ?";

  // Execute the first query to fetch users
  const fetchUsersPromise = new Promise((resolve, reject) => {
    connection.query(selectQuery, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

  // Chain the promises to insert the shop details after fetching the users
  fetchUsersPromise
    .then((rows) => {
      // Assuming you have a specific user in mind to retrieve the userId
      const user_id = rows[0].user_id;

      return new Promise((resolve, reject) => {
        const shopsquary = `select * from shops where user_id = '${user_id}'`;
        connection.query(shopsquary, (err, result) => {
          if (err) reject(err);
          else resolve;
          res.send({ shops: result });
        });
      });
    })
    .then((result) => {
      res.send({ shops: result });
    })
    .catch((err) => {
      console.error(err);
    });
});

app.post("/addShops/template2", (req, res) => {
  const {
    shop_name,
    shop_owner,
    shop_blockhead1,
    shop_block1,
    shop_blockhead2,
    shop_block2,
    shop_blockhead3,
    shop_block3,
    shop_keyhead1,
    shop_key1,
    shop_keyhead2,
    shop_key2,
    shop_email,
    shop_phone,
    insta,
    salestext,
    temp2,
    shop_tagline,
    uniqueIdentifier
  } = req.body;
  const token = req.headers.authorization;
  const selectQuery = `SELECT user_id FROM users WHERE jwt = '${token}' `;
  const insertQuery =
    "INSERT INTO shops(shop_name, insta, salestext, temp, shop_keyhead1, shop_key1, shop_keyhead2, shop_key2, shop_blockhead1, shop_blockhead2, shop_email, shop_phone, user_id, shop_owner, shop_block1, shop_block2, shop_blockhead3, shop_block3, shop_tagline, uniqueIdentifier) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";

  connection.query(selectQuery, (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error fetching user.");
    }

    if (rows.length === 0) {
      return res.status(401).send("Unauthorized user.");
    }

    const user_id = rows[0].user_id;

    connection.query(
      insertQuery,
      [
        shop_name,
        insta,
        salestext,
        temp2,
        shop_keyhead1,
        shop_key1,
        shop_keyhead2,
        shop_key2,
        shop_blockhead1,
        shop_blockhead2,
        shop_email,
        shop_phone,
        user_id,
        shop_owner,
        shop_block1,
        shop_block2,
        shop_blockhead3,
        shop_block3,
        shop_tagline,
        uniqueIdentifier
      ],
      (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).send("Error adding shop.");
        }

        console.log(result);
        return res.status(200).send("Shop added successfully!");
      }
    );
  });
});


app.post("/addShops/template2", (req, res) => {
  const {
    shop_name,
    shop_owner,
    shop_blockhead1,
    shop_block1,
    shop_blockhead2,
    shop_block2,
    shop_blockhead3,
    shop_block3,
    shop_keyhead1,
    shop_key1,
    shop_keyhead2,
    shop_key2,
    shop_email,
    shop_phone,
    insta,
    salestext,
    temp2,
    shop_tagline,
    uniqueIdentifier
  } = req.body;
  const token = req.headers.authorization;
  const selectQuery = `SELECT user_id FROM users WHERE jwt = '${token}' `;
  const insertQuery =
    "INSERT INTO shops(shop_name, insta, salestext, temp, shop_keyhead1, shop_key1, shop_keyhead2, shop_key2, shop_blockhead1, shop_blockhead2, shop_email, shop_phone, user_id, shop_owner, shop_block1, shop_block2, shop_blockhead3, shop_block3, shop_tagline, uniqueIdentifier) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";

  connection.query(selectQuery, (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error fetching user.");
    }

    if (rows.length === 0) {
      return res.status(401).send("Unauthorized user.");
    }

    const user_id = rows[0].user_id;

    connection.query(
      insertQuery,
      [
        shop_name,
        insta,
        salestext,
        temp2,
        shop_keyhead1,
        shop_key1,
        shop_keyhead2,
        shop_key2,
        shop_blockhead1,
        shop_blockhead2,
        shop_email,
        shop_phone,
        user_id,
        shop_owner,
        shop_block1,
        shop_block2,
        shop_blockhead3,
        shop_block3,
        shop_tagline,
        uniqueIdentifier
      ],
      (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).send("Error adding shop.");
        }

        console.log(result);
        return res.status(200).send("Shop added successfully!");
      }
    );
  });
});


app.get("/user/shops/template2", (req, res) => {
  const token = req.headers.authorization;
  const selectQuery = `SELECT user_id FROM users WHERE jwt = '${token}' `;
  const insertQuery = "SELECT * FROM shops where user_id = ?";

  // Execute the first query to fetch users
  const fetchUsersPromise = new Promise((resolve, reject) => {
    connection.query(selectQuery, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

  // Chain the promises to insert the shop details after fetching the users
  fetchUsersPromise
    .then((rows) => {
      // Assuming you have a specific user in mind to retrieve the userId
      const user_id = rows[0].user_id;

      return new Promise((resolve, reject) => {
        const shopsquary = `select * from shops where user_id = '${user_id}'`;
        connection.query(shopsquary, (err, result) => {
          if (err) reject(err);
          else resolve;
          res.send({ shops: result });
        });
      });
    })
    .then((result) => {
      res.send({ shops: result });
    })
    .catch((err) => {
      console.error(err);
    });
});

app.get("/user/template2", (req, res) => {
  const token = req.headers.authorization;
  const selectQuery = `SELECT user_id FROM users WHERE user_id = '${token}' `;
  const insertQuery = "SELECT * FROM shops where user_id = ?";

  // Execute the first query to fetch users
  const fetchUsersPromise = new Promise((resolve, reject) => {
    connection.query(selectQuery, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

  // Chain the promises to insert the shop details after fetching the users
  fetchUsersPromise
    .then((rows) => {
      // Assuming you have a specific user in mind to retrieve the userId
      const user_id = rows[0].user_id;

      return new Promise((resolve, reject) => {
        const shopsquary = `select * from shops where user_id = '${user_id}'`;
        connection.query(shopsquary, (err, result) => {
          if (err) reject(err);
          else resolve;
          res.send({ shops: result });
        });
      });
    })
    .then((result) => {
      res.send({ shops: result });
    })
    .catch((err) => {
      console.error(err);
    });
});


app.post("/addShops/template3", (req, res) => {
  const {
    shop_name,
    shop_owner,
    shop_blockhead1,
    shop_block1,
    shop_blockhead2,
    shop_block2,
    shop_blockhead3,
    shop_block3,
    shop_key3,
    shop_keyhead3,
    shop_key2,
    shop_email,
    shop_phone,
    insta,
    salestext,
    temp3,
    shop_tagline,
    uniqueIdentifier
  } = req.body;
  const token = req.headers.authorization;
  const selectQuery = `SELECT user_id FROM users WHERE jwt = '${token}' `;
  const insertQuery =
    "INSERT INTO shops(shop_name, insta, salestext, temp, shop_key2, shop_blockhead1, shop_blockhead2, shop_email, shop_phone, user_id, shop_owner, shop_block1, shop_block2, shop_blockhead3, shop_block3, shop_tagline, shop_key3, shop_keyhead3, uniqueIdentifier) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";

  connection.query(selectQuery, (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error fetching user.");
    }

    if (rows.length === 0) {
      return res.status(401).send("Unauthorized user.");
    }

    const user_id = rows[0].user_id;

    connection.query(
      insertQuery,
      [
        shop_name,
        insta,
        salestext,
        temp3,
        shop_key2,
        shop_blockhead1,
        shop_blockhead2,
        shop_email,
        shop_phone,
        user_id,
        shop_owner,
        shop_block1,
        shop_block2,
        shop_blockhead3,
        shop_block3,
        shop_tagline,
        shop_key3,
    shop_keyhead3,
    uniqueIdentifier
      ],
      (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).send("Error adding shop.");
        }

        console.log(result);
        return res.status(200).send("Shop added successfully!");
      }
    );
  });
});

app.post("/addShops/template7", (req, res) => {
  const {
    shop_name,
    shop_owner,
    shop_blockhead1,
    shop_block1,
    shop_blockhead2,
    shop_block2,
    shop_blockhead3,
    shop_block3,
    shop_key3,
    shop_keyhead3,
    shop_key2,
    shop_email,
    shop_phone,
    insta,
    salestext,
    temp7,
    shop_tagline,
    uniqueIdentifier
  } = req.body;
  const token = req.headers.authorization;
  const selectQuery = `SELECT user_id FROM users WHERE jwt = '${token}' `;
  const insertQuery =
    "INSERT INTO shops(shop_name, insta, salestext, temp, shop_key2, shop_blockhead1, shop_blockhead2, shop_email, shop_phone, user_id, shop_owner, shop_block1, shop_block2, shop_blockhead3, shop_block3, shop_tagline, shop_key3, shop_keyhead3, uniqueIdentifier) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";

  connection.query(selectQuery, (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error fetching user.");
    }

    if (rows.length === 0) {
      return res.status(401).send("Unauthorized user.");
    }

    const user_id = rows[0].user_id;

    connection.query(
      insertQuery,
      [
        shop_name,
        insta,
        salestext,
        temp7,
        shop_key2,
        shop_blockhead1,
        shop_blockhead2,
        shop_email,
        shop_phone,
        user_id,
        shop_owner,
        shop_block1,
        shop_block2,
        shop_blockhead3,
        shop_block3,
        shop_tagline,
        shop_key3,
    shop_keyhead3,
    uniqueIdentifier
      ],
      (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).send("Error adding shop.");
        }

        console.log(result);
        return res.status(200).send("Shop added successfully!");
      }
    );
  });
});

app.get("/user/shops/template7", (req, res) => {
  const token = req.headers.authorization;
  const selectQuery = `SELECT user_id FROM users WHERE jwt = '${token}' `;
  const insertQuery = "SELECT * FROM shops where user_id = ?";

  // Execute the first query to fetch users
  const fetchUsersPromise = new Promise((resolve, reject) => {
    connection.query(selectQuery, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

  // Chain the promises to insert the shop details after fetching the users
  fetchUsersPromise
    .then((rows) => {
      // Assuming you have a specific user in mind to retrieve the userId
      const user_id = rows[0].user_id;

      return new Promise((resolve, reject) => {
        const shopsquary = `select * from shops where user_id = '${user_id}'`;
        connection.query(shopsquary, (err, result) => {
          if (err) reject(err);
          else resolve;
          res.send({ shops: result });
        });
      });
    })
    .then((result) => {
      res.send({ shops: result });
    })
    .catch((err) => {
      console.error(err);
    });
});

app.get("/user/template7", (req, res) => {
  const token = req.headers.authorization;
  const selectQuery = `SELECT user_id FROM users WHERE user_id = '${token}' `;
  const insertQuery = "SELECT * FROM shops where user_id = ?";

  // Execute the first query to fetch users
  const fetchUsersPromise = new Promise((resolve, reject) => {
    connection.query(selectQuery, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

  // Chain the promises to insert the shop details after fetching the users
  fetchUsersPromise
    .then((rows) => {
      // Assuming you have a specific user in mind to retrieve the userId
      const user_id = rows[0].user_id;

      return new Promise((resolve, reject) => {
        const shopsquary = `select * from shops where user_id = '${user_id}'`;
        connection.query(shopsquary, (err, result) => {
          if (err) reject(err);
          else resolve;
          res.send({ shops: result });
        });
      });
    })
    .then((result) => {
      res.send({ shops: result });
    })
    .catch((err) => {
      console.error(err);
    });
});


app.post("/addShops/template8", (req, res) => {
  const {
    shop_name,
    shop_owner,
    shop_blockhead1,
    shop_block1,
    shop_blockhead2,
    shop_block2,
    shop_blockhead3,
    shop_block3,
    shop_key3,
    shop_keyhead3,
    shop_key2,
    shop_email,
    shop_phone,
    insta,
    salestext,
    temp8,
    shop_tagline,
    uniqueIdentifier
  } = req.body;
  const token = req.headers.authorization;
  const selectQuery = `SELECT user_id FROM users WHERE jwt = '${token}' `;
  const insertQuery =
    "INSERT INTO shops(shop_name, insta, salestext, temp, shop_key2, shop_blockhead1, shop_blockhead2, shop_email, shop_phone, user_id, shop_owner, shop_block1, shop_block2, shop_blockhead3, shop_block3, shop_tagline, shop_key3, shop_keyhead3, uniqueIdentifier) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";

  connection.query(selectQuery, (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error fetching user.");
    }

    if (rows.length === 0) {
      return res.status(401).send("Unauthorized user.");
    }

    const user_id = rows[0].user_id;

    connection.query(
      insertQuery,
      [
        shop_name,
        insta,
        salestext,
        temp8,
        shop_key2,
        shop_blockhead1,
        shop_blockhead2,
        shop_email,
        shop_phone,
        user_id,
        shop_owner,
        shop_block1,
        shop_block2,
        shop_blockhead3,
        shop_block3,
        shop_tagline,
        shop_key3,
    shop_keyhead3,
    uniqueIdentifier
      ],
      (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).send("Error adding shop.");
        }

        console.log(result);
        return res.status(200).send("Shop added successfully!");
      }
    );
  });
});

app.get("/user/shops/template7", (req, res) => {
  const token = req.headers.authorization;
  const selectQuery = `SELECT user_id FROM users WHERE jwt = '${token}' `;
  const insertQuery = "SELECT * FROM shops where user_id = ?";

  // Execute the first query to fetch users
  const fetchUsersPromise = new Promise((resolve, reject) => {
    connection.query(selectQuery, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

  // Chain the promises to insert the shop details after fetching the users
  fetchUsersPromise
    .then((rows) => {
      // Assuming you have a specific user in mind to retrieve the userId
      const user_id = rows[0].user_id;

      return new Promise((resolve, reject) => {
        const shopsquary = `select * from shops where user_id = '${user_id}'`;
        connection.query(shopsquary, (err, result) => {
          if (err) reject(err);
          else resolve;
          res.send({ shops: result });
        });
      });
    })
    .then((result) => {
      res.send({ shops: result });
    })
    .catch((err) => {
      console.error(err);
    });
});

app.get("/user/template7", (req, res) => {
  const token = req.headers.authorization;
  const selectQuery = `SELECT user_id FROM users WHERE user_id = '${token}' `;
  const insertQuery = "SELECT * FROM shops where user_id = ?";

  // Execute the first query to fetch users
  const fetchUsersPromise = new Promise((resolve, reject) => {
    connection.query(selectQuery, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

  // Chain the promises to insert the shop details after fetching the users
  fetchUsersPromise
    .then((rows) => {
      // Assuming you have a specific user in mind to retrieve the userId
      const user_id = rows[0].user_id;

      return new Promise((resolve, reject) => {
        const shopsquary = `select * from shops where user_id = '${user_id}'`;
        connection.query(shopsquary, (err, result) => {
          if (err) reject(err);
          else resolve;
          res.send({ shops: result });
        });
      });
    })
    .then((result) => {
      res.send({ shops: result });
    })
    .catch((err) => {
      console.error(err);
    });
});

app.get("/user/shops/template8", (req, res) => {
  const token = req.headers.authorization;
  const selectQuery = `SELECT user_id FROM users WHERE jwt = '${token}' `;
  const insertQuery = "SELECT * FROM shops where user_id = ?";

  // Execute the first query to fetch users
  const fetchUsersPromise = new Promise((resolve, reject) => {
    connection.query(selectQuery, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

  // Chain the promises to insert the shop details after fetching the users
  fetchUsersPromise
    .then((rows) => {
      // Assuming you have a specific user in mind to retrieve the userId
      const user_id = rows[0].user_id;

      return new Promise((resolve, reject) => {
        const shopsquary = `select * from shops where user_id = '${user_id}'`;
        connection.query(shopsquary, (err, result) => {
          if (err) reject(err);
          else resolve;
          res.send({ shops: result });
        });
      });
    })
    .then((result) => {
      res.send({ shops: result });
    })
    .catch((err) => {
      console.error(err);
    });
});

app.get("/user/template8", (req, res) => {
  const token = req.headers.authorization;
  const selectQuery = `SELECT user_id FROM users WHERE user_id = '${token}' `;
  const insertQuery = "SELECT * FROM shops where user_id = ?";

  // Execute the first query to fetch users
  const fetchUsersPromise = new Promise((resolve, reject) => {
    connection.query(selectQuery, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

  // Chain the promises to insert the shop details after fetching the users
  fetchUsersPromise
    .then((rows) => {
      // Assuming you have a specific user in mind to retrieve the userId
      const user_id = rows[0].user_id;

      return new Promise((resolve, reject) => {
        const shopsquary = `select * from shops where user_id = '${user_id}'`;
        connection.query(shopsquary, (err, result) => {
          if (err) reject(err);
          else resolve;
          res.send({ shops: result });
        });
      });
    })
    .then((result) => {
      res.send({ shops: result });
    })
    .catch((err) => {
      console.error(err);
    });
});



app.get("/user/shops/data", (req, res) => {
  const token = req.headers.authorization;
  const selectQuery = `SELECT shop_id FROM shops WHERE shop_id = '${token}' `;
  const insertQuery = "SELECT * FROM shops where user_id = ?";

  // Execute the first query to fetch users
  const fetchUsersPromise = new Promise((resolve, reject) => {
    connection.query(selectQuery, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

  // Chain the promises to insert the shop details after fetching the users
  fetchUsersPromise
    .then((rows) => {
      // Assuming you have a specific user in mind to retrieve the userId
      const user_id = rows[0].shop_id;

      return new Promise((resolve, reject) => {
        const shopsquary = `select * from shops where shop_id = '${user_id}'`;
        connection.query(shopsquary, (err, result) => {
          if (err) reject(err);
          else resolve;
          res.send({ shops: result });
        });
      });
    })
    .then((result) => {
      res.send({ shops: result });
    })
    .catch((err) => {
      console.error(err);
    });
});




app.post("/addShops/Fashion", upload.single("image"), (req, res) => {
  const {
    shop_name,
    shop_owner,
    shop_abouthead,
    shop_about,
    shop_blockhead2,
    shop_block2,
    shop_blockhead3,
    shop_block3,
    temp2,
  } = req.body;

  const images = req.file.filename;
  const token = req.headers.authorization;
  const selectQuery = `SELECT user_id FROM users WHERE jwt = '${token}' `;
  const insertQuery =
    "INSERT INTO shops(shop_name, temp2, shop_abouthead, shop_about, shop_blockhead2, user_id, shop_owner, shop_block2, shop_blockhead3, shop_block3, images) VALUES (?,?,?,?,?,?,?,?,?,?,?)";

  connection.query(selectQuery, (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error fetching user.");
    }

    if (rows.length === 0) {
      return res.status(401).send("Unauthorized user.");
    }

    const user_id = rows[0].user_id;

    connection.query(
      insertQuery,
      [
        shop_name,
        temp2,
        shop_abouthead,
        shop_about,
        shop_blockhead2,
        user_id,
        shop_owner,
        shop_block2,
        shop_blockhead3,
        shop_block3,
        images,
      ],
      (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).send("Error adding shop.");
        }

        console.log(result);
        return res.status(200).send("Shop added successfully!");
      }
    );
  });
});

app.post("/addshopimg1", upload.single("image"), (req, res) => {
  const images1 = req.file.filename;
  const shop_id = req.headers.authorization; // Access the Authorization header correctly

  const updateQuery = "UPDATE shops SET images1 = ? WHERE shop_id = ?";

  connection.query(updateQuery, [images1, shop_id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error updating shop image.");
    }

    if (result.affectedRows === 0) {
      return res.status(404).send("Shop not found or no changes made.");
    }

    console.log(result);
    return res.status(200).send("Shop image updated successfully!");
  });
});

app.post("/addshopimg2", upload.single("image"), (req, res) => {
  const images2 = req.file.filename;
  const shop_id = req.headers.authorization; // Access the Authorization header correctly

  const updateQuery = "UPDATE shops SET images2 = ? WHERE shop_id = ?";

  connection.query(updateQuery, [images2, shop_id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error updating shop image.");
    }

    if (result.affectedRows === 0) {
      return res.status(404).send("Shop not found or no changes made.");
    }

    console.log(result);
    return res.status(200).send("Shop image updated successfully!");
  });
});

app.post("/addshopimg3", upload.single("image"), (req, res) => {
  const images3 = req.file.filename;
  const shop_id = req.headers.authorization; // Access the Authorization header correctly

  const updateQuery = "UPDATE shops SET images3 = ? WHERE shop_id = ?";

  connection.query(updateQuery, [images3, shop_id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error updating shop image.");
    }

    if (result.affectedRows === 0) {
      return res.status(404).send("Shop not found or no changes made.");
    }

    console.log(result);
    return res.status(200).send("Shop image updated successfully!");
  });
});

app.post("/addshopimg4", upload.single("image"), (req, res) => {
  const images4 = req.file.filename;
  const shop_id = req.headers.authorization; // Access the Authorization header correctly

  const updateQuery = "UPDATE shops SET images4 = ? WHERE shop_id = ?";

  connection.query(updateQuery, [images4, shop_id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error updating shop image.");
    }

    if (result.affectedRows === 0) {
      return res.status(404).send("Shop not found or no changes made.");
    }

    console.log(result);
    return res.status(200).send("Shop image updated successfully!");
  });
});

app.post("/addshopimg5", upload.single("image"), (req, res) => {
  const images5 = req.file.filename;
  const shop_id = req.headers.authorization; // Access the Authorization header correctly

  const updateQuery = "UPDATE shops SET images5 = ? WHERE shop_id = ?";

  connection.query(updateQuery, [images5, shop_id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error updating shop image.");
    }

    if (result.affectedRows === 0) {
      return res.status(404).send("Shop not found or no changes made.");
    }

    console.log(result);
    return res.status(200).send("Shop image updated successfully!");
  });
});

app.post("/addshopimg6", upload.single("image"), (req, res) => {
  const images6 = req.file.filename;
  const shop_id = req.headers.authorization; // Access the Authorization header correctly

  const updateQuery = "UPDATE shops SET images6 = ? WHERE shop_id = ?";

  connection.query(updateQuery, [images6, shop_id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error updating shop image.");
    }

    if (result.affectedRows === 0) {
      return res.status(404).send("Shop not found or no changes made.");
    }

    console.log(result);
    return res.status(200).send("Shop image updated successfully!");
  });
});

app.post("/addshopimg7", upload.single("image"), (req, res) => {
  const images7 = req.file.filename;
  const shop_id = req.headers.authorization; // Access the Authorization header correctly

  const updateQuery = "UPDATE shops SET images7 = ? WHERE shop_id = ?";

  connection.query(updateQuery, [images7, shop_id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error updating shop image.");
    }

    if (result.affectedRows === 0) {
      return res.status(404).send("Shop not found or no changes made.");
    }

    console.log(result);
    return res.status(200).send("Shop image updated successfully!");
  });
});

app.post("/addshopimg8", upload.single("image"), (req, res) => {
  const images8 = req.file.filename;
  const shop_id = req.headers.authorization; // Access the Authorization header correctly

  const updateQuery = "UPDATE shops SET images8 = ? WHERE shop_id = ?";

  connection.query(updateQuery, [images8, shop_id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error updating shop image.");
    }

    if (result.affectedRows === 0) {
      return res.status(404).send("Shop not found or no changes made.");
    }

    console.log(result);
    return res.status(200).send("Shop image updated successfully!");
  });
});

app.post("/addshopimg9", upload.single("image"), (req, res) => {
  const images9 = req.file.filename;
  const shop_id = req.headers.authorization; // Access the Authorization header correctly

  const updateQuery = "UPDATE shops SET images9 = ? WHERE shop_id = ?";

  connection.query(updateQuery, [images9, shop_id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error updating shop image.");
    }

    if (result.affectedRows === 0) {
      return res.status(404).send("Shop not found or no changes made.");
    }

    console.log(result);
    return res.status(200).send("Shop image updated successfully!");
  });
});

app.post("/addshopimg10", upload.single("image"), (req, res) => {
  const images10 = req.file.filename;
  const shop_id = req.headers.authorization; // Access the Authorization header correctly

  const updateQuery = "UPDATE shops SET images10 = ? WHERE shop_id = ?";

  connection.query(updateQuery, [images10, shop_id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error updating shop image.");
    }

    if (result.affectedRows === 0) {
      return res.status(404).send("Shop not found or no changes made.");
    }

    console.log(result);
    return res.status(200).send("Shop image updated successfully!");
  });
});

app.post("/addshopimg11", upload.single("image"), (req, res) => {
  const images11 = req.file.filename;
  const shop_id = req.headers.authorization; // Access the Authorization header correctly

  const updateQuery = "UPDATE shops SET images11 = ? WHERE shop_id = ?";

  connection.query(updateQuery, [images11, shop_id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error updating shop image.");
    }

    if (result.affectedRows === 0) {
      return res.status(404).send("Shop not found or no changes made.");
    }

    console.log(result);
    return res.status(200).send("Shop image updated successfully!");
  });
});

app.post("/addshopimg12", upload.single("image"), (req, res) => {
  const images12 = req.file.filename;
  const shop_id = req.headers.authorization; // Access the Authorization header correctly

  const updateQuery = "UPDATE shops SET images12 = ? WHERE shop_id = ?";

  connection.query(updateQuery, [images12, shop_id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error updating shop image.");
    }

    if (result.affectedRows === 0) {
      return res.status(404).send("Shop not found or no changes made.");
    }

    console.log(result);
    return res.status(200).send("Shop image updated successfully!");
  });
});

app.post("/addshopimg13", upload.single("image"), (req, res) => {
  const images13 = req.file.filename;
  const shop_id = req.headers.authorization; // Access the Authorization header correctly

  const updateQuery = "UPDATE shops SET images13 = ? WHERE shop_id = ?";

  connection.query(updateQuery, [images13, shop_id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error updating shop image.");
    }

    if (result.affectedRows === 0) {
      return res.status(404).send("Shop not found or no changes made.");
    }

    console.log(result);
    return res.status(200).send("Shop image updated successfully!");
  });
});

app.post("/addshopimg14", upload.single("image"), (req, res) => {
  const images14 = req.file.filename;
  const shop_id = req.headers.authorization; // Access the Authorization header correctly

  const updateQuery = "UPDATE shops SET images14 = ? WHERE shop_id = ?";

  connection.query(updateQuery, [images14, shop_id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error updating shop image.");
    }

    if (result.affectedRows === 0) {
      return res.status(404).send("Shop not found or no changes made.");
    }

    console.log(result);
    return res.status(200).send("Shop image updated successfully!");
  });
});

app.post("/addshopimg15", upload.single("image"), (req, res) => {
  const images15 = req.file.filename;
  const shop_id = req.headers.authorization; // Access the Authorization header correctly

  const updateQuery = "UPDATE shops SET images15 = ? WHERE shop_id = ?";

  connection.query(updateQuery, [images15, shop_id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error updating shop image.");
    }

    if (result.affectedRows === 0) {
      return res.status(404).send("Shop not found or no changes made.");
    }

    console.log(result);
    return res.status(200).send("Shop image updated successfully!");
  });
});

app.post("/add/shop/logo5", upload.single("image"), (req, res) => {
  const images15 = req.file.filename;
  const shop_id = req.headers.authorization; // Access the Authorization header correctly

  const updateQuery = "UPDATE shops SET logo = ? WHERE shop_id = ?";

  connection.query(updateQuery, [images15, shop_id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error updating shop image.");
    }

    if (result.affectedRows === 0) {
      return res.status(404).send("Shop not found or no changes made.");
    }

    console.log(result);
    return res.status(200).send("Shop image updated successfully!");
  });
});

app.get("/custom/img/shop", (req, res) => {
  const id = req.headers.authorization;
  const selectQuery = `SELECT shop_id FROM shops WHERE shop_id = '${id}' `;
  const insertQuery = "SELECT * FROM products where id = ?";

  // Execute the first query to fetch users
  const fetchUsersPromise = new Promise((resolve, reject) => {
    connection.query(selectQuery, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

  // Chain the promises to insert the shop details after fetching the users
  fetchUsersPromise
    .then((rows) => {
      // Assuming you have a specific user in mind to retrieve the userId
      const id = rows[0].shop_id;

      return new Promise((resolve, reject) => {
        const shopsquary = `select * from shops where shop_id = '${id}'`;
        connection.query(shopsquary, (err, result) => {
          if (err) reject(err);
          else resolve;
          res.send({ img: result });
        });
      });
    })
    .then((result) => {
      res.send({ img: result });
    })
    .catch((err) => {
      console.error(err);
    });
});


app.post("/addprodsimg2", upload.single("image"), (req, res) => {
  const images2 = req.file.filename;
  const shop_id = req.headers.authorization; // Access the Authorization header correctly

  const updateQuery = "UPDATE products SET images2 = ? WHERE id = ?";

  connection.query(updateQuery, [images2, shop_id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error updating shop image.");
    }

    if (result.affectedRows === 0) {
      return res.status(404).send("Shop not found or no changes made.");
    }

    console.log(result);
    return res.status(200).send("Shop image updated successfully!");
  });
});

app.post("/addprodsimg3", upload.single("image"), (req, res) => {
  const images3 = req.file.filename;
  const shop_id = req.headers.authorization; // Access the Authorization header correctly

  const updateQuery = "UPDATE products SET images3 = ? WHERE id = ?";

  connection.query(updateQuery, [images3, shop_id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error updating shop image.");
    }

    if (result.affectedRows === 0) {
      return res.status(404).send("Shop not found or no changes made.");
    }

    console.log(result);
    return res.status(200).send("Shop image updated successfully!");
  });
});

app.post("/addprodsimg4", upload.single("image"), (req, res) => {
  const images4 = req.file.filename;
  const shop_id = req.headers.authorization; // Access the Authorization header correctly

  const updateQuery = "UPDATE products SET images4 = ? WHERE id = ?";

  connection.query(updateQuery, [images4, shop_id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error updating shop image.");
    }

    if (result.affectedRows === 0) {
      return res.status(404).send("Shop not found or no changes made.");
    }

    console.log(result);
    return res.status(200).send("Shop image updated successfully!");
  });
});

app.post("/addprodsimg5", upload.single("image"), (req, res) => {
  const images5 = req.file.filename;
  const shop_id = req.headers.authorization; // Access the Authorization header correctly

  const updateQuery = "UPDATE products SET images5 = ? WHERE id = ?";

  connection.query(updateQuery, [images5, shop_id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error updating shop image.");
    }

    if (result.affectedRows === 0) {
      return res.status(404).send("Shop not found or no changes made.");
    }

    console.log(result);
    return res.status(200).send("Shop image updated successfully!");
  });
});

app.post("/addprodsimg6", upload.single("image"), (req, res) => {
  const images6 = req.file.filename;
  const shop_id = req.headers.authorization; // Access the Authorization header correctly

  const updateQuery = "UPDATE products SET images6 = ? WHERE id = ?";

  connection.query(updateQuery, [images6, shop_id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error updating shop image.");
    }

    if (result.affectedRows === 0) {
      return res.status(404).send("Shop not found or no changes made.");
    }

    console.log(result);
    return res.status(200).send("Shop image updated successfully!");
  });
});

app.get("/custom/img/prods", (req, res) => {
  const id = req.headers.authorization;
  const selectQuery = `SELECT id FROM products WHERE id = '${id}' `;
  const insertQuery = "SELECT * FROM products where id = ?";

  // Execute the first query to fetch users
  const fetchUsersPromise = new Promise((resolve, reject) => {
    connection.query(selectQuery, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

  // Chain the promises to insert the shop details after fetching the users
  fetchUsersPromise
    .then((rows) => {
      // Assuming you have a specific user in mind to retrieve the userId
      const id = rows[0].id;

      return new Promise((resolve, reject) => {
        const shopsquary = `select * from products where id = '${id}'`;
        connection.query(shopsquary, (err, result) => {
          if (err) reject(err);
          else resolve;
          res.send({ img: result });
        });
      });
    })
    .then((result) => {
      res.send({ img: result });
    })
    .catch((err) => {
      console.error(err);
    });
});

app.get("/order/details", (req, res) => {
  const id = req.headers.authorization;
  const selectQuery = `SELECT orders_id FROM orders WHERE orders_id = '${id}' `;
  const insertQuery = "SELECT * FROM products where id = ?";

  // Execute the first query to fetch users
  const fetchUsersPromise = new Promise((resolve, reject) => {
    connection.query(selectQuery, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

  // Chain the promises to insert the shop details after fetching the users
  fetchUsersPromise
    .then((rows) => {
      // Assuming you have a specific user in mind to retrieve the userId
      const id = rows[0].orders_id;

      return new Promise((resolve, reject) => {
        const shopsquary = `select * from orders where orders_id = '${id}'`;
        connection.query(shopsquary, (err, result) => {
          if (err) reject(err);
          else resolve;
          res.send({ order: result });
        });
      });
    })
    .then((result) => {
      res.send({ order: result });
    })
    .catch((err) => {
      console.error(err);
    });
});

app.post('/create-checkout-session', async (req, res) => {
  const { token } = req.body;

  try {
    // Create a Stripe customer
    const customer = await stripe.customers.create();

    // Create a Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price: 'price_1NkrkYSGyKMMAZwsXbXR6K2x', // Replace with your Stripe Price ID
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: 'http://localhost:3000/', // Redirect URL after successful payment
      cancel_url: 'http://localhost:3000/Plans',   // Redirect URL if user cancels payment
    });

    // Update MySQL user's premium status
    const updateUserQuery = `UPDATE users SET premium = 1 WHERE jwt = ?`;

    connection.query(updateUserQuery, [token], (err, result) => {
      if (err) {
        console.error('Error updating user premium status: ', err);
        res.status(500).send('Internal Server Error');
      } else {
        res.json({ url: session.url }); // Return the Stripe Checkout URL
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/create-checkout-session2', async (req, res) => {
  const { token } = req.body;

  try {
    // Create a Stripe customer
    const customer = await stripe.customers.create();

    // Create a Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price: 'price_1NkrlCSGyKMMAZwsqYLRItgR', // Replace with your Stripe Price ID
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: 'http://localhost:3000/', // Redirect URL after successful payment
      cancel_url: 'http://localhost:3000/Plans',   // Redirect URL if user cancels payment
    });

    // Update MySQL user's premium status
    const updateUserQuery = `UPDATE users SET premium = 2 WHERE jwt = ?`;

    connection.query(updateUserQuery, [token], (err, result) => {
      if (err) {
        console.error('Error updating user premium status: ', err);
        res.status(500).send('Internal Server Error');
      } else {
        res.json({ url: session.url }); // Return the Stripe Checkout URL
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/create-checkout-session3', async (req, res) => {
  const { token } = req.body;

  try {
    // Create a Stripe customer
    const customer = await stripe.customers.create();

    // Create a Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price: 'price_1NkrliSGyKMMAZwsvglP94Bk', // Replace with your Stripe Price ID
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: 'http://localhost:3000/', // Redirect URL after successful payment
      cancel_url: 'http://localhost:3000/Plans',   // Redirect URL if user cancels payment
    });

    // Update MySQL user's premium status
    const updateUserQuery = `UPDATE users SET premium = 3 WHERE jwt = ?`;

    connection.query(updateUserQuery, [token], (err, result) => {
      if (err) {
        console.error('Error updating user premium status: ', err);
        res.status(500).send('Internal Server Error');
      } else {
        res.json({ url: session.url }); // Return the Stripe Checkout URL
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
});
// This endpoint receives the Stripe webhook event when a payment is successful

app.get("/all/users", (req, res) => {
  const id = req.headers.authorization;
  const selectQuery = `SELECT * FROM users`;
  const insertQuery = "SELECT * FROM products where id = ?";

  // Execute the first query to fetch users
  const fetchUsersPromise = new Promise((resolve, reject) => {
    connection.query(selectQuery, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

  // Chain the promises to insert the shop details after fetching the users
  fetchUsersPromise
    .then((rows) => {
      // Assuming you have a specific user in mind to retrieve the userId
      const id = rows[0].orders_id;

      return new Promise((resolve, reject) => {
        const shopsquary = `select * from users`;
        connection.query(shopsquary, (err, result) => {
          if (err) reject(err);
          else resolve;
          res.send({ order: result });
        });
      });
    })
    .then((result) => {
      res.send({ order: result });
    })
    .catch((err) => {
      console.error(err);
    });
});

app.get("/user/profile/details", (req, res) => {
  const id = req.headers.authorization;
  const selectQuery = `SELECT user_id FROM users WHERE user_id = '${id}' `;
  const insertQuery = "SELECT * FROM products where id = ?";

  // Execute the first query to fetch users
  const fetchUsersPromise = new Promise((resolve, reject) => {
    connection.query(selectQuery, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

  // Chain the promises to insert the shop details after fetching the users
  fetchUsersPromise
    .then((rows) => {
      // Assuming you have a specific user in mind to retrieve the userId
      const id = rows[0].user_id;

      return new Promise((resolve, reject) => {
        const shopsquary = `select * from users where user_id = '${id}'`;
        connection.query(shopsquary, (err, result) => {
          if (err) reject(err);
          else resolve;
          res.send({ order: result });
        });
      });
    })
    .then((result) => {
      res.send({ order: result });
    })
    .catch((err) => {
      console.error(err);
    });
});

app.post("/follow", (req, res) => {
  const { id } = req.body;
  const token = req.headers.authorization;
  const selectQuery = `SELECT user_id FROM users WHERE jwt = '${token}' `;
  const insertQuery = "INSERT INTO follows(follower_id, following_id) VALUES (?,?)";

  connection.query(selectQuery, (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error fetching user.");
    }

    if (rows.length === 0) {
      return res.status(401).send("Unauthorized user.");
    }

    const user_id = rows[0].user_id;

    connection.query(
      insertQuery,
      [user_id, id],
      (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).send("Error following user.");
        }

        console.log(result);
        return res.status(200).send("User followed successfully!");
      }
    );
  });
});

app.get('/check-follow/:followerId/:followedId', (req, res) => {
  const { followerId, followedId } = req.params;

  // Query the database to check if the follower is following the followed user
  const query = `SELECT COUNT(*) AS count FROM follows WHERE follower_id = ? AND following_id = ?`;

  connection.query(query, [followerId, followedId], (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Database error' });
      return;
    }

    const isFollowing = results[0].count > 0;
    res.json({ isFollowing });
  });
});

// Unfollow a user
app.post("/unfollow", (req, res) => {
  const { id } = req.body;
  const token = req.headers.authorization;
  const selectQuery = `SELECT user_id FROM users WHERE jwt = '${token}' `;
  const insertQuery = "DELETE FROM follows WHERE follower_id = ? AND following_id = ?";

  connection.query(selectQuery, (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error fetching user.");
    }

    if (rows.length === 0) {
      return res.status(401).send("Unauthorized user.");
    }

    const user_id = rows[0].user_id;

    connection.query(
      insertQuery,
      [user_id, id],
      (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).send("Error following user.");
        }

        console.log(result);
        return res.status(200).send("User followed successfully!");
      }
    );
  });
});

app.get('/follower-count/:userId', (req, res) => {
  const { userId } = req.params;

  // Query the database to count the number of followers for the given user
  const query = `SELECT COUNT(*) AS followerCount FROM follows WHERE following_id = ?`;

  connection.query(query, [userId], (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Database error' });
      return;
    }

    const followerCount = results[0].followerCount;
    res.json({ followerCount });
  });
});

app.post("/addprofilepic", upload.single("image"), (req, res) => {
  const images5 = req.file.filename;
  const token = req.headers.authorization;
  const selectQuery = `SELECT user_id FROM users WHERE jwt = '${token}' `;
  const insertQuery =
    "UPDATE users SET porfilepic = ? WHERE user_id = ?";

  connection.query(selectQuery, (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error fetching user.");
    }

    if (rows.length === 0) {
      return res.status(401).send("Unauthorized user.");
    }

    const user_id = rows[0].user_id;

    connection.query(
      insertQuery,
      [
        images5,
        user_id
      ],
      (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).send("Error adding shop.");
        }

        console.log(result);
        return res.status(200).send("Shop added successfully!");
      }
    );
  });
});

app.get("/all/shops/main/page", (req, res) => {
  const sqlget = "SELECT * FROM shops";

  connection.query(sqlget, (err, results) => {
    if (err) {
      console.error("Error fetching data from MySQL: ", err);
      res.status(500).json({ error: "Error fetching data from MySQL" });
    } else {
      res.send({ shops: results });
    }
  });
});

app.get("/all/products/main/page", (req, res) => {
  const sqlget = "SELECT * FROM products";

  connection.query(sqlget, (err, results) => {
    if (err) {
      console.error("Error fetching data from MySQL: ", err);
      res.status(500).json({ error: "Error fetching data from MySQL" });
    } else {
      res.send({ shops: results });
    }
  });
});

app.get("/main/shop/logo", (req, res) => {
  const token = req.headers.authorization;
  const selectQuery = `SELECT * FROM shops WHERE shop_id = '${token}' `;
  const insertQuery = "SELECT * FROM shops where user_id = ?";

  // Execute the first query to fetch users
  const fetchUsersPromise = new Promise((resolve, reject) => {
    connection.query(selectQuery, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

  // Chain the promises to insert the shop details after fetching the users
  fetchUsersPromise
    .then((rows) => {
      // Assuming you have a specific user in mind to retrieve the userId
      const user_id = rows[0].shop_id;

      return new Promise((resolve, reject) => {
        const shopsquary = `select * from shops where shop_id = '${user_id}'`;
        connection.query(shopsquary, (err, result) => {
          if (err) reject(err);
          else resolve;
          res.send({ shops: result });
        });
      });
    })
    .then((result) => {
      res.send({ shops: result });
    })
    .catch((err) => {
      console.error(err);
    });
});

app.post("/followpage", (req, res) => {
  const { shop_id } = req.body;
  const token = req.headers.authorization;
  const selectQuery = `SELECT user_id FROM users WHERE jwt = '${token}' `;
  const insertQuery = "INSERT INTO followshop(user_id, shop_id) VALUES (?,?)";

  connection.query(selectQuery, (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error fetching user.");
    }

    if (rows.length === 0) {
      return res.status(401).send("Unauthorized user.");
    }

    const user_id = rows[0].user_id;

    connection.query(
      insertQuery,
      [user_id, shop_id],
      (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).send("Error following user.");
        }

        console.log(result);
        return res.status(200).send("User followed successfully!");
      }
    );
  });
});

app.get('/check-followpage/:followerId/:followedId', (req, res) => {
  const { followerId, followedId } = req.params;

  // Query the database to check if the follower is following the followed user
  const query = `SELECT COUNT(*) AS count FROM followshop WHERE user_id = ? AND shop_id = ?`;

  connection.query(query, [followerId, followedId], (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Database error' });
      return;
    }

    const isFollowing = results[0].count > 0;
    res.json({ isFollowing });
  });
});

// Unfollow a user
app.post("/unfollowpage", (req, res) => {
  const { id } = req.body;
  const token = req.headers.authorization;
  const selectQuery = `SELECT user_id FROM users WHERE jwt = '${token}' `;
  const insertQuery = "DELETE FROM followshop WHERE user_id = ? AND shop_id = ?";

  connection.query(selectQuery, (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error fetching user.");
    }

    if (rows.length === 0) {
      return res.status(401).send("Unauthorized user.");
    }

    const user_id = rows[0].user_id;

    connection.query(
      insertQuery,
      [user_id, id],
      (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).send("Error following user.");
        }

        console.log(result);
        return res.status(200).send("User followed successfully!");
      }
    );
  });
});

app.get("/shop/main/user/details/profile", (req, res) => {
  const token = req.headers.authorization;
  const selectQuery = `SELECT * FROM users WHERE user_id = '${token}' `;
  const insertQuery = "SELECT * FROM shops where user_id = ?";

  // Execute the first query to fetch users
  const fetchUsersPromise = new Promise((resolve, reject) => {
    connection.query(selectQuery, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

  // Chain the promises to insert the shop details after fetching the users
  fetchUsersPromise
    .then((rows) => {
      // Assuming you have a specific user in mind to retrieve the userId
      const user_id = rows[0].user_id;

      return new Promise((resolve, reject) => {
        const shopsquary = `select * from users where user_id = '${user_id}'`;
        connection.query(shopsquary, (err, result) => {
          if (err) reject(err);
          else resolve;
          res.send({ shops: result });
        });
      });
    })
    .then((result) => {
      res.send({ shops: result });
    })
    .catch((err) => {
      console.error(err);
    });
});

app.get('/products-count/:userId', (req, res) => {
  const { userId } = req.params;

  // Query the database to count the number of followers for the given user
  const query = `SELECT COUNT(*) AS followerCount FROM products WHERE shop_id = ?`;

  connection.query(query, [userId], (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Database error' });
      return;
    }

    const followerCount = results[0].followerCount;
    res.json({ followerCount });
  });
});

app.post('/api/ratings', (req, res) => {
  const { shop_id, rating, user_id } = req.body;
  const sql = 'INSERT INTO shoprating (shop_id, rating, user_id) VALUES (?, ?, ?)';
  connection.query(sql, [shop_id, rating, user_id], (error, results) => {
    if (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error saving rating' });
    }
    return res.status(200).json({ message: 'Rating saved successfully' });
  });
});

// Endpoint to calculate and return the average rating for an item
app.get('/api/average-rating/:shop_id', (req, res) => {
  const shop_id = req.params.shop_id;
  const sql = 'SELECT AVG(rating) AS averageRating FROM shoprating WHERE shop_id = ?';
  connection.query(sql, [shop_id], (error, results) => {
    if (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error calculating average rating' });
    }
    const averageRating = results[0].averageRating || 0; // Default to 0 if no ratings found
    return res.status(200).json({ averageRating });
  });
});

app.get('/shops-count/:userId', (req, res) => {
  const { userId } = req.params;

  // Query the database to count the number of followers for the given user
  const query = `SELECT COUNT(*) AS followerCount FROM shops WHERE user_id = ?`;

  connection.query(query, [userId], (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Database error' });
      return;
    }

    const followerCount = results[0].followerCount;
    res.json({ followerCount });
  });
});



app.post("/followdis", (req, res) => {
  const { user_id } = req.body;
  const token = req.headers.authorization;
  const selectQuery = `SELECT user_id FROM users WHERE jwt = '${token}' `;
  const insertQuery = "INSERT INTO follows(follower_id, following_id) VALUES (?,?)";

  connection.query(selectQuery, (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error fetching user.");
    }

    if (rows.length === 0) {
      return res.status(401).send("Unauthorized user.");
    }

    const user_id = rows[0].user_id;

    connection.query(
      insertQuery,
      [user_id, user_id],
      (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).send("Error following user.");
        }

        console.log(result);
        return res.status(200).send("User followed successfully!");
      }
    );
  });
});

app.get('/check-follow/:followerId/:followedId', (req, res) => {
  const { followerId, followedId } = req.params;

  // Query the database to check if the follower is following the followed user
  const query = `SELECT COUNT(*) AS count FROM follows WHERE follower_id = ? AND following_id = ?`;

  connection.query(query, [followerId, followedId], (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Database error' });
      return;
    }

    const isFollowing = results[0].count > 0;
    res.json({ isFollowing });
  });
});

// Unfollow a user
app.post("/unfollowdis", (req, res) => {
  const { user_id } = req.body;
  const token = req.headers.authorization;
  const selectQuery = `SELECT user_id FROM users WHERE jwt = '${token}' `;
  const insertQuery = "DELETE FROM follows WHERE follower_id = ? AND following_id = ?";

  connection.query(selectQuery, (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error fetching user.");
    }

    if (rows.length === 0) {
      return res.status(401).send("Unauthorized user.");
    }

    const user_id = rows[0].user_id;

    connection.query(
      insertQuery,
      [user_id, user_id],
      (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).send("Error following user.");
        }

        console.log(result);
        return res.status(200).send("User followed successfully!");
      }
    );
  });
});

app.post("/start/chat", (req, res) => {
  const { user_id, first_name1, first_name2 } = req.body;
  const token = req.headers.authorization;
  const selectQuery = `SELECT user_id FROM users WHERE jwt = '${token}' `;
  const findChatQuery = `SELECT chat_id, user1, user2 FROM chat_data 
                         WHERE (user1 = ? AND user2 = ?) 
                         OR (user1 = ? AND user2 = ?)`;

  connection.query(selectQuery, (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error fetching user.");
    }

    if (rows.length === 0) {
      return res.status(401).send("Unauthorized user.");
    }

    const id = rows[0].user_id;

    // Check if a chat between user1 and user2 already exists
    connection.query(
      findChatQuery,
      [id, user_id, user_id, id],
      (err, chatRows) => {
        if (err) {
          console.error(err);
          return res.status(500).send("Error checking chat data.");
        }

        if (chatRows.length > 0) {
          // Chat already exists, return the chat_id
          const { chat_id, user1, user2 } = chatRows[0];
          return res.status(200).json({ chat_id, user1, user2 });
        } else {
          // Chat doesn't exist, create a new chat row
          const insertQuery = `INSERT INTO chat_data(user1, user2, first_name1, first_name2) VALUES (?, ?, ?, ?)`;
          connection.query(
            insertQuery,
            [id, user_id, first_name1, first_name2],
            (err, result) => {
              if (err) {
                console.error(err);
                return res.status(500).send("Error creating new chat.");
              }

              const chat_id = result.insertId;
              return res.status(200).json({ chat_id, user1: id, user2: user_id });
            }
          );
        }
      }
    );
  });
});

app.get("/chat/users/display", (req, res) => {
  const token = req.headers.authorization;
  const selectQuery = `SELECT * FROM users WHERE jwt = '${token}'`;

  // Execute the first query to fetch users
  const fetchUsersPromise = new Promise((resolve, reject) => {
    connection.query(selectQuery, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

  // Chain the promises to insert the shop details after fetching the users
  fetchUsersPromise
    .then((rows) => {
      if (rows.length === 0) {
        // Handle the case where no user with the given token is found
        throw new Error("User not found");
      }
      
      // Assuming you have a specific user in mind to retrieve the userId
      const id = rows[0].user_id;

      return new Promise((resolve, reject) => {
        const shopsQuery = `
          SELECT * FROM chat_data 
          WHERE (user1 = '${id}' OR user2 = '${id}')
        `;
        // Replace user1 and user2 with the actual column names in your chat_data table
        
        connection.query(shopsQuery, [id, id], (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      });
    })
    .then((result) => {
      res.send({ chat: result });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send({ error: err.message });
    });
});

app.get("/user/chat/details/1", (req, res) => {
  const token = req.headers.authorization;
  const sqlget = `SELECT * FROM users where user_id = '${token}'`;

  connection.query(sqlget, (err, results) => {
    if (err) {
      console.error("Error fetching data from MySQL: ", err);
      res.status(500).json({ error: "Error fetching data from MySQL" });
    } else {
      res.send({ user: results });
    }
  });
});

app.get("/user/chat/details/2", (req, res) => {
  const token = req.headers.authorization;
  const sqlget = `SELECT * FROM users where user_id = '${token}'`;

  connection.query(sqlget, (err, results) => {
    if (err) {
      console.error("Error fetching data from MySQL: ", err);
      res.status(500).json({ error: "Error fetching data from MySQL" });
    } else {
      res.send({ user: results });
    }
  });
});

app.get("/chat/messages/display/api", (req, res) => {
  const token = req.headers.authorization;
  const selectQuery = `SELECT * FROM chat_messages WHERE chat_id = '${token}'`;

  // Execute the query to fetch chat messages based on the provided token
  connection.query(selectQuery, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error fetching chat messages.");
    } else {
      res.send({ chat: result });
    }
  });
});

app.post("/send/message/sender", (req, res) => {
  const { message_text, user_id_1, user_id_2, sender_id } = req.body;
  const token = req.headers.authorization;
  const insertQuery = "INSERT INTO chat_messages(chat_id, message_text, sender_id, user_id_1, user_id_2) VALUES (?, ?, ?, ?, ?)";

  // Execute the query to insert the message
  connection.query(insertQuery, [token, message_text, sender_id, user_id_1, user_id_2], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error sending message.");
    } else {
      console.log(result);
      res.status(200).send("Message sent successfully!");
    }
  });
});

app.post('/create-customer', async (req, res) => {
  try {
    const customer = await stripe.customers.create({
      email: req.body.email,
      payment_method: req.body.paymentMethodId,
      invoice_settings: {
        default_payment_method: req.body.paymentMethodId,
      },
    });

    // Save the customer ID in your database
    const insertCustomerQuery = `INSERT INTO customers (stripe_customer_id, email) VALUES ('${customer.id}', '${req.body.email}')`;
    db.query(insertCustomerQuery, (err, result) => {
      if (err) {
        console.error('Error inserting customer into the database: ', err);
        res.status(500).json({ error: 'Internal server error' });
      } else {
        res.status(200).json({ customer });
      }
    });
  } catch (error) {
    console.error('Error creating customer: ', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.post('/subscribe/dropment', async (req, res) => {
  const { userId, paymentMethodId } = req.body;

  try {
    // Create a customer in Stripe
    const customer = await stripe.customers.create({
      email: req.body.email,
      payment_method: paymentMethodId,
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    // Subscribe the customer to a plan
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: 'price_1NkrliSGyKMMAZwsvglP94Bk' }],
      expand: ['latest_invoice.payment_intent'],
    });

    // Check if the payment was successful
    if (subscription.latest_invoice.payment_intent.status === 'succeeded') {
      // Update the user's premium status in the database
      const updateUserQuery = `UPDATE users SET premium = 1, stripe_customer_id = '${customer.id}' WHERE user_id = ${userId}`;
      db.query(updateUserQuery, (err, result) => {
        if (err) {
          console.error('Error updating user premium status: ', err);
          res.status(500).json({ error: 'Internal server error' });
        } else {
          res.status(200).json({ message: 'Subscription successful' });
        }
      });
    } else {
      res.status(400).json({ error: 'Payment failed' });
    }
  } catch (error) {
    console.error('Error subscribing customer: ', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get("/prods/details/shop/details", (req, res) => {
  const token = req.headers.authorization;
  const selectQuery = `SELECT * FROM shops WHERE shop_id = '${token}'`;

  // Execute the query to fetch chat messages based on the provided token
  connection.query(selectQuery, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error fetching chat messages.");
    } else {
      res.send({ shops: result });
    }
  });
});

app.get("/user/details/shop/details", (req, res) => {
  const token = req.headers.authorization;
  const selectQuery = `SELECT * FROM users WHERE user_id = '${token}'`;

  // Execute the query to fetch chat messages based on the provided token
  connection.query(selectQuery, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error fetching chat messages.");
    } else {
      res.send({ users: result });
    }
  });
});

app.post("/place/order", (req, res) => {
  const {
    name,
    Phone,
    Email,
    streetadrs,
    city,
    state,
    zipcode,
    country,
    id,
    product,
    shop_id,
    occupation,
    sender_id,
    age,
    orderDateTime // Added orderDateTime field in the request body
  } = req.body;

  const token = req.headers.authorization;
  const selectQuery = `SELECT user_id FROM users WHERE jwt = ?`; // Use placeholders
  const insertQuery =
    "INSERT INTO orders(name, Phone, Email, streetadrs, city, state, zipcode, country, id, product, shop_id, occupation, sender_id, age, orderDateTime) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

  connection.query(selectQuery, [token], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error fetching user.");
    }

    if (rows.length === 0) {
      return res.status(401).send("Unauthorized user.");
    }

    const user_id = rows[0].user_id;

    connection.query(
      insertQuery,
      [
        name,
        Phone,
        Email,
        streetadrs,
        city,
        state,
        zipcode,
        country,
        id,
        product,
        shop_id,
        occupation,
        user_id,
        age,
        orderDateTime // Include orderDateTime in the values to be inserted
      ],
      (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).send("Error placing order.");
        }

        console.log(result);
        // Update the product amount after a successful order
        const updateQuery = `
        UPDATE products 
        SET amount = amount - 1, 
            status = CASE 
                       WHEN amount <= 1 THEN 'Sold Out'
                       ELSE status 
                     END 
        WHERE id = ?
      `;
      
        connection.query(updateQuery, [id], (err, updateResult) => {
          if (err) {
            console.error(err);
            return res.status(500).send("Error updating product quantity.");
          }

          console.log(updateResult);
          return res.status(200).send("Order placed successfully! Product quantity updated.");
        });
      }
    );
  });
});

app.post("/orders", (req, res) => {
  const name = req.body.name;
  const Phone = req.body.Phone;
  const Email = req.body.Email;
  const streetadrs = req.body.streetadrs;
  const city = req.body.city;
  const state = req.body.state;
  const zipcode = req.body.zipcode;
  const country = req.body.country;
  const id = req.body.id;
  const product = req.body.product;
  const shop_id = req.body.shop_id;
  const product_id = req.body.product_id;
  const token = req.headers.authorization;
  const selectQuery = `SELECT user_id FROM users WHERE jwt = '${token}' `;
  const insertQuery =
    "INSERT INTO orders(name, Phone, Email, streetadrs, city, state, zipcode, country, id, product, sender_id, shop_id) VALUES (?, ?, ?, ?, ?, ?,?,?,?,?,?,?)";

  // Execute the first query to fetch users
  const fetchUsersPromise = new Promise((resolve, reject) => {
    connection.query(selectQuery, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

  // Chain the promises to insert the shop details after fetching the users
  fetchUsersPromise
    .then((rows) => {
      // Assuming you have a specific user in mind to retrieve the userId
      const sender_id = rows[0].user_id;
      // Execute the second query to insert shop details
      return new Promise((resolve, reject) => {
        connection.query(
          insertQuery,
          [
            name,
            Phone,
            Email,
            streetadrs,
            city,
            state,
            zipcode,
            country,
            id,
            product,
            sender_id,
            shop_id,
            product_id,
          ],
          (err, result) => {
            if (err) reject(err);
            else resolve(result);
          }
        );
      });
    })
    .then((result) => {
      console.log(result);
      res.status(200).send("Shop added successfully!");
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error adding shop.");
    });
});


app.get("/prods/details/orders/for/details", (req, res) => {
  const token = req.headers.authorization;
  const selectQuery = `SELECT * FROM products WHERE id = '${token}'`;

  // Execute the query to fetch chat messages based on the provided token
  connection.query(selectQuery, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error fetching chat messages.");
    } else {
      res.send({ products: result });
    }
  }); 
});

app.get("/user/details/orders/for/details", (req, res) => {
  const token = req.headers.authorization;
  const selectQuery = `SELECT * FROM users WHERE jwt = '${token}'`;

  // Execute the query to fetch chat messages based on the provided token
  connection.query(selectQuery, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error fetching chat messages.");
    } else {
      res.send({ products: result });
    }
  });
});

app.get("/sales/stats/shop", (req, res) => {
  const token = req.headers.authorization;
  const selectQuery = `SELECT * FROM orders WHERE shop_id = '${token}'`;

  // Execute the query to fetch chat messages based on the provided token
  connection.query(selectQuery, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error fetching chat messages.");
    } else {
      res.send({ products: result });
    }
  });
});

app.get("/user/details/shop/user/id", (req, res) => {
  const id = req.headers.authorization;
  const selectQuery = `SELECT user_id FROM shops WHERE user_id = '${id}' `;
  const insertQuery = "SELECT * FROM products where id = ?";

  // Execute the first query to fetch users
  const fetchUsersPromise = new Promise((resolve, reject) => {
    connection.query(selectQuery, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

  // Chain the promises to insert the shop details after fetching the users
  fetchUsersPromise
    .then((rows) => {
      // Assuming you have a specific user in mind to retrieve the userId
      const id = rows[0].user_id;

      return new Promise((resolve, reject) => {
        const shopsquary = `select * from users where user_id = '${id}'`;
        connection.query(shopsquary, (err, result) => {
          if (err) reject(err);
          else resolve;
          res.send({ user: result });
        });
      });
    })
    .then((result) => {
      res.send({ order: result });
    })
    .catch((err) => {
      console.error(err);
    });
});

app.get("/user/order/display", (req, res) => {
  const id = req.headers.authorization;
  const selectQuery = `SELECT user_id FROM users WHERE jwt = '${id}' `;
  const insertQuery = "SELECT * FROM products where id = ?";

  // Execute the first query to fetch users
  const fetchUsersPromise = new Promise((resolve, reject) => {
    connection.query(selectQuery, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

  // Chain the promises to insert the shop details after fetching the users
  fetchUsersPromise
    .then((rows) => {
      // Assuming you have a specific user in mind to retrieve the userId
      const id = rows[0].user_id;

      return new Promise((resolve, reject) => {
        const shopsquary = `select * from orders where sender_id = '${id}'`;
        connection.query(shopsquary, (err, result) => {
          if (err) reject(err);
          else resolve;
          res.send({ user: result });
        });
      });
    })
    .then((result) => {
      res.send({ order: result });
    })
    .catch((err) => {
      console.error(err);
    });
});

app.put('/api/update-order-status/:orderId', (req, res) => {
  const { orderId } = req.params;
  const { newStatus } = req.body;

  const sql = `UPDATE orders SET status = ? WHERE orders_id = ?`;

  connection.query(sql, [newStatus, orderId], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    } else {
      res.json({ message: 'Order status updated successfully' });
    }
  });
});

app.post("/delete/products", (req, res) => {
  const { user_id } = req.body;
  const token = req.headers.authorization;
  const selectQuery = `SELECT id FROM products WHERE id = '${token}' `;
  const insertQuery = "DELETE FROM products WHERE id = ?";

  connection.query(selectQuery, (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error fetching user.");
    }

    if (rows.length === 0) {
      return res.status(401).send("Unauthorized user.");
    }

    const user_id = rows[0].id;

    connection.query(
      insertQuery,
      [user_id,],
      (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).send("Error following user.");
        }

        console.log(result);
        return res.status(200).send("User followed successfully!");
      }
    );
  });
});

app.post('/api/stories', upload.single('media'), (req, res) => {
  const { token, content } = req.body;
  const mediaPath = req.file.filename;
  const mediaType = req.file.mimetype.startsWith('image/') ? 'image' : 'video';
  const selectQuery = 'SELECT * FROM users WHERE jwt = ?';

  // Verify the token and fetch the user ID from the database
  connection.query(selectQuery, [token], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error fetching user.');
    }

    if (rows.length === 0) {
      return res.status(401).send('Unauthorized user.');
    }

    const user_id = rows[0].user_id;
    const name = rows[0].first_name

    const sql = 'INSERT INTO stories (user_id, content, media_path, media_type, name) VALUES (?, ?, ?, ?, ?)';
    connection.query(sql, [user_id, content, mediaPath, mediaType, name], (err, result) => {
      if (err) {
        console.error('Error inserting into database: ' + err);
        res.status(500).json({ error: 'Could not create story' });
        return;
      }

      res.json({ message: 'Story created successfully' });
      console.log(result)
    });
  });
});

// GET endpoint to fetch all stories
app.get('/api/stories', (req, res) => {
  const token = req.headers.authorization; // Get the token from the Authorization header

  const selectQuery = 'SELECT user_id FROM users WHERE user_id = ?';

  // Verify the token and fetch the user ID from the database
  connection.query(selectQuery, [token], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error fetching user.');
    }

    if (rows.length === 0) {
      return res.status(401).send('Unauthorized user.');
    }

    const userId = rows[0].user_id; // Assuming you have a way to get the user's ID

    const sql = `
    SELECT * FROM stories WHERE user_id = ?
    `;

    connection.query(sql, [userId], (err, stories) => {
      if (err) {
        console.error('Error retrieving stories: ' + err);
        res.status(500).json({ error: 'Could not fetch stories' });
        return;
      }

      res.json(stories);
    });
  });
});

app.get('/api/stories/users/display', (req, res) => {
  const token = req.headers.authorization; // Get the token from the Authorization header

  const selectQuery = 'SELECT user_id FROM users WHERE jwt = ?';

  // Verify the token and fetch the user ID from the database
  connection.query(selectQuery, [token], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error fetching user.');
    }

    if (rows.length === 0) {
      return res.status(401).send('Unauthorized user.');
    }

    const userId = rows[0].user_id; // Assuming you have a way to get the user's ID

    const sql = `
      SELECT user_id, first_name, last_name, porfilepic
      FROM users
      WHERE user_id IN (
        SELECT following_id
        FROM follows
        WHERE follower_id = ?
      )
    `;

    connection.query(sql, [userId], (err, users) => {
      if (err) {
        console.error('Error retrieving users: ' + err);
        res.status(500).json({ error: 'Could not fetch users' });
        return;
      }

      res.send({ order: users });
    });
  });
});
// Serve static files from the 'public' directory
app.use(express.static('public'));

app.get("/user/details/send/id/details", (req, res) => {
  const id = req.headers.authorization;
  const selectQuery = `SELECT user_id FROM users WHERE user_id = '${id}' `;
  const insertQuery = "SELECT * FROM products where id = ?";

  // Execute the first query to fetch users
  const fetchUsersPromise = new Promise((resolve, reject) => {
    connection.query(selectQuery, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

  // Chain the promises to insert the shop details after fetching the users
  fetchUsersPromise
    .then((rows) => {
      // Assuming you have a specific user in mind to retrieve the userId
      const id = rows[0].user_id;

      return new Promise((resolve, reject) => {
        const shopsquary = `select * from users where user_id = '${id}'`;
        connection.query(shopsquary, (err, result) => {
          if (err) reject(err);
          else resolve;
          res.send({ user: result });
        });
      });
    })
    .then((result) => {
      res.send({ order: result });
    })
    .catch((err) => {
      console.error(err);
    });
});

app.post("/add/custom/shop", (req, res) => {
  const {section} = req.body
  const token = req.headers.authorization;
  const selectQuery = `SELECT user_id FROM users WHERE jwt = '${token}' `;
  const insertQuery =
    "INSERT INTO shops(user_id, temp, build) VALUES (?, ?, ?)";

  connection.query(selectQuery, (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error fetching user.");
    }

    if (rows.length === 0) {
      return res.status(401).send("Unauthorized user.");
    }

    const user_id = rows[0].user_id;

    connection.query(
      insertQuery,
      [
        user_id,
        'incomplete',
        section
      ],
      (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).send("Error adding shop.");
        }

        console.log(result);
        return res.status(200).send("Shop added successfully!");
      }
    );
  });
});

app.put('/nav/bar/update', (req, res) => {
  const shop_id = req.headers.authorization; // Use 'authorization' instead of destructuring
  const { nav } = req.body;

  const sql = `UPDATE shops SET section1 = ? WHERE shop_id = ?`;

  connection.query(sql, [nav, shop_id], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    } else {
      res.json({ message: 'Order status updated successfully' });
    }
  });
});

app.put('/header/update', (req, res) => {
  const shop_id = req.headers.authorization; // Use 'authorization' instead of destructuring
  const { nav } = req.body;

  const sql = `UPDATE shops SET section2 = ? WHERE shop_id = ?`;

  connection.query(sql, [nav, shop_id], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    } else {
      res.json({ message: 'Order status updated successfully' });
    }
  });
});

app.put('/section3/update', (req, res) => {
  const shop_id = req.headers.authorization; // Use 'authorization' instead of destructuring
  const { nav } = req.body;

  const sql = `UPDATE shops SET section3 = ? WHERE shop_id = ?`;

  connection.query(sql, [nav, shop_id], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    } else {
      res.json({ message: 'Order status updated successfully' });
    }
  });
});

app.put('/section4/update', (req, res) => {
  const shop_id = req.headers.authorization; // Use 'authorization' instead of destructuring
  const { nav } = req.body;

  const sql = `UPDATE shops SET section4 = ? WHERE shop_id = ?`;

  connection.query(sql, [nav, shop_id], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    } else {
      res.json({ message: 'Order status updated successfully' });
    }
  });
});

app.put('/section5/update', (req, res) => {
  const shop_id = req.headers.authorization; // Use 'authorization' instead of destructuring
  const { nav } = req.body;

  const sql = `UPDATE shops SET section5 = ? WHERE shop_id = ?`;

  connection.query(sql, [nav, shop_id], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    } else {
      res.json({ message: 'Order status updated successfully' });
    }
  });
});
app.put('/section6/update', (req, res) => {
  const shop_id = req.headers.authorization; // Use 'authorization' instead of destructuring
  const { nav } = req.body;

  const sql = `UPDATE shops SET section6 = ? WHERE shop_id = ?`;

  connection.query(sql, [nav, shop_id], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    } else {
      res.json({ message: 'Order status updated successfully' });
    }
  });
});

app.put('/section7/update', (req, res) => {
  const shop_id = req.headers.authorization; // Use 'authorization' instead of destructuring
  const { nav } = req.body;

  const sql = `UPDATE shops SET section7 = ? WHERE shop_id = ?`;

  connection.query(sql, [nav, shop_id], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    } else {
      res.json({ message: 'Order status updated successfully' });
    }
  });
});

app.put('/section8/update', (req, res) => {
  const shop_id = req.headers.authorization; // Use 'authorization' instead of destructuring
  const { nav } = req.body;

  const sql = `UPDATE shops SET section8 = ? WHERE shop_id = ?`;

  connection.query(sql, [nav, shop_id], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    } else {
      res.json({ message: 'Order status updated successfully' });
    }
  });
});

app.put('/section9/update', (req, res) => {
  const shop_id = req.headers.authorization; // Use 'authorization' instead of destructuring
  const { nav } = req.body;

  const sql = `UPDATE shops SET section9 = ? WHERE shop_id = ?`;

  connection.query(sql, [nav, shop_id], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    } else {
      res.json({ message: 'Order status updated successfully' });
    }
  });
});

app.put('/section10/update', (req, res) => {
  const shop_id = req.headers.authorization; // Use 'authorization' instead of destructuring
  const { nav } = req.body;

  const sql = `UPDATE shops SET section10 = ? WHERE shop_id = ?`;

  connection.query(sql, [nav, shop_id], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    } else {
      res.json({ message: 'Order status updated successfully' });
    }
  });
});

app.put('/section11/update', (req, res) => {
  const shop_id = req.headers.authorization; // Use 'authorization' instead of destructuring
  const { nav } = req.body;

  const sql = `UPDATE shops SET section11 = ? WHERE shop_id = ?`;

  connection.query(sql, [nav, shop_id], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    } else {
      res.json({ message: 'Order status updated successfully' });
    }
  });
});

app.put('/section12/update', (req, res) => {
  const shop_id = req.headers.authorization; // Use 'authorization' instead of destructuring
  const { nav } = req.body;

  const sql = `UPDATE shops SET section12 = ? WHERE shop_id = ?`;

  connection.query(sql, [nav, shop_id], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    } else {
      res.json({ message: 'Order status updated successfully' });
    }
  });
});

app.put('/footer/update', (req, res) => {
  const shop_id = req.headers.authorization; // Use 'authorization' instead of destructuring
  const { nav } = req.body;

  const sql = `UPDATE shops SET section13 = ? WHERE shop_id = ?`;

  connection.query(sql, [nav, shop_id], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    } else {
      res.json({ message: 'Order status updated successfully' });
    }
  });
});

app.get("/custom/shop/sections/form", (req, res) => {
  const id = req.headers.authorization;
  const selectQuery = `SELECT shop_id FROM shops WHERE shop_id = '${id}' `;
  const insertQuery = "SELECT * FROM products where id = ?";

  // Execute the first query to fetch users
  const fetchUsersPromise = new Promise((resolve, reject) => {
    connection.query(selectQuery, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

  // Chain the promises to insert the shop details after fetching the users
  fetchUsersPromise
    .then((rows) => {
      // Assuming you have a specific user in mind to retrieve the userId
      const id = rows[0].shop_id;

      return new Promise((resolve, reject) => {
        const shopsquary = `select * from shops where shop_id = '${id}'`;
        connection.query(shopsquary, (err, result) => {
          if (err) reject(err);
          else resolve;
          res.send({ shop: result });
        });
      });
    })
    .then((result) => {
      res.send({ shop: result });
    })
    .catch((err) => {
      console.error(err);
    });
});

app.put('/nav/bar/data', (req, res) => {
  const shop_id = req.headers.authorization; // Use 'authorization' instead of destructuring
  const { shop_name, btn1, btn2, btn3, instaLink, phone } = req.body;

  const sql = `UPDATE shops SET shop_name = ?, button1 = ?, button2 = ?, button3 = ?, instagram_link = ?, phone_header_link = ? WHERE shop_id = ?`;

  connection.query(sql, [shop_name, btn1, btn2, btn3, instaLink, phone, shop_id], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    } else {
      res.json({ message: 'Order status updated successfully' });
    }
  });
});

app.put('/header/data', (req, res) => {
  const shop_id = req.headers.authorization; // Use 'authorization' instead of destructuring
  const { salestext, tagline, phone } = req.body;

  const sql = `UPDATE shops SET salestext = ?, shop_tagline = ? WHERE shop_id = ?`;

  connection.query(sql, [salestext, tagline, shop_id], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    } else {
      res.json({ message: 'Order status updated successfully' });
    }
  });
});

app.put('/section1/data', (req, res) => {
  const shop_id = req.headers.authorization; // Use 'authorization' instead of destructuring
  const { shop_blockhead1, shop_block1, shop_blockhead2, shop_block2,
  shop_blockhead3, shop_block3 } = req.body;

  const sql = `UPDATE shops SET shop_blockhead1 = ?, shop_block1 = ?, shop_blockhead2 = ?, shop_block2 = ?, shop_blockhead3 = ?, shop_block3 = ? WHERE shop_id = ?`;

  connection.query(sql, [shop_blockhead1, shop_block1, shop_blockhead2, shop_block2, shop_blockhead3, shop_block3, shop_id], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    } else {
      res.json({ message: 'Order status updated successfully' });
    }
  });
});

app.put('/footer/data', (req, res) => {
  const shop_id = req.headers.authorization; // Use 'authorization' instead of destructuring
  const { insta, shop_phone, shop_email, othersocials } = req.body;

  const sql = `UPDATE shops SET insta = ?, shop_phone = ?, shop_email = ?, othersocials = ?, temp = ? WHERE shop_id = ?`;

  connection.query(sql, [insta, shop_phone, shop_email, othersocials, 'custom', shop_id], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    } else {
      res.json({ message: 'Footer data updated successfully' });
    }
  });
});

app.get("/custom/shop/display", (req, res) => {
  const id = req.headers.authorization;
  const selectQuery = `SELECT shop_id FROM shops WHERE shop_id = '${id}' `;
  const insertQuery = "SELECT * FROM shops where id = ?";

  // Execute the first query to fetch users
  const fetchUsersPromise = new Promise((resolve, reject) => {
    connection.query(selectQuery, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

  // Chain the promises to insert the shop details after fetching the users
  fetchUsersPromise
    .then((rows) => {
      // Assuming you have a specific user in mind to retrieve the userId
      const id = rows[0].shop_id;

      return new Promise((resolve, reject) => {
        const shopsquary = `select * from shops where shop_id = '${id}'`;
        connection.query(shopsquary, (err, result) => {
          if (err) reject(err);
          else resolve;
          res.send({ shops: result });
        });
      });
    })
    .then((result) => {
      res.send({ shops: result });
    })
    .catch((err) => {
      console.error(err);
    });
});

app.get("/section/4/new/arrivals", (req, res) => {
  const token = req.headers.authorization;
  const selectQuery = `SELECT shop_id FROM shops WHERE shop_id = '${token}' `;
  const insertQuery = "SELECT * FROM products where shop_id = ?";

  // Execute the first query to fetch users
  const fetchUsersPromise = new Promise((resolve, reject) => {
    connection.query(selectQuery, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

  // Chain the promises to insert the shop details after fetching the users
  fetchUsersPromise
    .then((rows) => {
      // Assuming you have a specific user in mind to retrieve the userId
      const shop_id = rows[0].shop_id;

      return new Promise((resolve, reject) => {
        const shopsquary = `select * from products where shop_id = '${shop_id}' limit 5`;
        connection.query(shopsquary, (err, result) => {
          if (err) reject(err);
          else resolve;
          res.send({ items: result });
        });
      });
    })
    .then((result) => {
      res.send({ items: result });
    })
    .catch((err) => {
      console.error(err);
    });
});


app.post('/color/selection/section/3', (req, res) => {
  const shop_id = req.headers.authorization; // Use 'authorization' from headers
  const { 
    fontColor1, 
    fontColor2, 
    fontColor3, 
    fontColor4, 
    fontColor5, 
    fontColor6, 
    fontColor7, 
    fontColor8,
    backgroundColor1,
    backgroundColor2,
    backgroundColor3,
    backgroundColor4,
    backgroundColor5
  } = req.body;

  // Check if a record with the same shop_id and section '1' already exists
  const checkExistingSql = 'SELECT id FROM component_look WHERE shop_id = ? AND section = ?';
  connection.query(checkExistingSql, [shop_id, '3'], (checkErr, checkResult) => {
    if (checkErr) {
      console.error(checkErr);
      res.status(500).json({ message: 'Internal server error' });
    } else {
      if (checkResult.length > 0) {
        // If a record exists, delete the previous record
        const existingRecordId = checkResult[0].id;
        const deleteSql = 'DELETE FROM component_look WHERE id = ?';
        connection.query(deleteSql, [existingRecordId], (deleteErr, deleteResult) => {
          if (deleteErr) {
            console.error(deleteErr);
            res.status(500).json({ message: 'Internal server error' });
          } else {
            // Insert the new record
            insertNewRecordNav();
          }
        });
      } else {
        // If no record exists, insert the new record directly
        insertNewRecordNav();
      }
    }
  });

  function insertNewRecordNav() {
    const sql = `INSERT INTO component_look (shop_id, section, font_colour1, font_colour2, font_colour3, font_colour4, font_colour5, font_colour6, font_colour7, font_colour8, background_colour1, background_colour2, background_colour3, background_colour4, background_colour5)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    connection.query(sql, [shop_id, '3', fontColor1, fontColor2, fontColor3, fontColor4, fontColor5, fontColor6, fontColor7, fontColor8, backgroundColor1, backgroundColor2, backgroundColor3, backgroundColor4, backgroundColor5], (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
      } else {
        res.json({ message: 'Color selection added to the database successfully' });
      }
    });
  }
});


app.post('/color/selection/section/1', (req, res) => {
  const shop_id = req.headers.authorization; // Use 'authorization' from headers
  const { 
    fontColor1, 
    fontColor2, 
    fontColor3, 
    fontColor4, 
    fontColor5, 
    fontColor6, 
    fontColor7, 
    fontColor8,
    backgroundColor1,
    backgroundColor2,
    backgroundColor3,
    backgroundColor4,
    backgroundColor5
  } = req.body;

  // Check if a record with the same shop_id and section '1' already exists
  const checkExistingSql = 'SELECT id FROM component_look WHERE shop_id = ? AND section = ?';
  connection.query(checkExistingSql, [shop_id, '1'], (checkErr, checkResult) => {
    if (checkErr) {
      console.error(checkErr);
      res.status(500).json({ message: 'Internal server error' });
    } else {
      if (checkResult.length > 0) {
        // If a record exists, delete the previous record
        const existingRecordId = checkResult[0].id;
        const deleteSql = 'DELETE FROM component_look WHERE id = ?';
        connection.query(deleteSql, [existingRecordId], (deleteErr, deleteResult) => {
          if (deleteErr) {
            console.error(deleteErr);
            res.status(500).json({ message: 'Internal server error' });
          } else {
            // Insert the new record
            insertNewRecordNav();
          }
        });
      } else {
        // If no record exists, insert the new record directly
        insertNewRecordNav();
      }
    }
  });

  function insertNewRecordNav() {
    const sql = `INSERT INTO component_look (shop_id, section, font_colour1, font_colour2, font_colour3, font_colour4, font_colour5, font_colour6, font_colour7, font_colour8, background_colour1, background_colour2, background_colour3, background_colour4, background_colour5)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    connection.query(sql, [shop_id, '1', fontColor1, fontColor2, fontColor3, fontColor4, fontColor5, fontColor6, fontColor7, fontColor8, backgroundColor1, backgroundColor2, backgroundColor3, backgroundColor4, backgroundColor5], (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
      } else {
        res.json({ message: 'Color selection added to the database successfully' });
      }
    });
  }
});

app.post('/color/selection/section/footer', (req, res) => {
  const shop_id = req.headers.authorization; // Use 'authorization' from headers
  const { 
    fontColor1, 
    fontColor2, 
    fontColor3, 
    fontColor4, 
    fontColor5, 
    fontColor6, 
    fontColor7, 
    fontColor8,
    backgroundColor1,
    backgroundColor2,
    backgroundColor3,
    backgroundColor4,
    backgroundColor5
  } = req.body;

  const sql = `INSERT INTO component_look (shop_id, section, font_colour1, font_colour2, font_colour3, font_colour4, font_colour5, font_colour6, font_colour7, font_colour8, background_colour1, background_colour2, background_colour3, background_colour4, background_colour5)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  connection.query(sql, [shop_id, '12', fontColor1, fontColor2, fontColor3, fontColor4, fontColor5, fontColor6, fontColor7, fontColor8, backgroundColor1, backgroundColor2, backgroundColor3, backgroundColor4, backgroundColor5], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    } else {
      res.json({ message: 'Color selection added to the database successfully' });
    }
  });
});

app.post('/color/selection/section/2', (req, res) => {
  const shop_id = req.headers.authorization; // Use 'authorization' from headers

  const {
    fontColor1,
    fontColor2,
    fontColor3,
    fontColor4,
    fontColor5,
    fontColor6,
    fontColor7,
    fontColor8,
    backgroundColor1,
    backgroundColor2,
    backgroundColor3,
    backgroundColor4,
    backgroundColor5
  } = req.body;

  // Check if a record with the same shop_id and section '2' already exists
  const checkExistingSql = 'SELECT id FROM component_look WHERE shop_id = ? AND section = ?';
  connection.query(checkExistingSql, [shop_id, '2'], (checkErr, checkResult) => {
    if (checkErr) {
      console.error(checkErr);
      return res.status(500).json({ message: 'Internal server error' });
    }

    if (checkResult.length > 0) {
      // If a record exists, delete the previous record
      const existingRecordId = checkResult[0].id;
      const deleteSql = 'DELETE FROM component_look WHERE id = ?';
      connection.query(deleteSql, [existingRecordId], (deleteErr, deleteResult) => {
        if (deleteErr) {
          console.error(deleteErr);
          return res.status(500).json({ message: 'Internal server error' });
        }
        // Insert the new record
        insertNewRecord();
      });
    } else {
      // If no record exists, insert the new record directly
      insertNewRecord();
    }
  });

  function insertNewRecord() {
    const sql = `INSERT INTO component_look (shop_id, section, font_colour1, font_colour2, font_colour3, font_colour4, font_colour5, font_colour6, font_colour7, font_colour8, background_colour1, background_colour2, background_colour3, background_colour4, background_colour5)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    connection.query(
      sql,
      [
        shop_id,
        '2',
        fontColor1,
        fontColor2,
        fontColor3,
        fontColor4,
        fontColor5,
        fontColor6,
        fontColor7,
        fontColor8,
        backgroundColor1,
        backgroundColor2,
        backgroundColor3,
        backgroundColor4,
        backgroundColor5
      ],
      (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: 'Internal server error' });
        }
        res.json({ message: 'Color selection added to the database successfully' });
      }
    );
  }
});

app.post('/color/selection/section/4', (req, res) => {
  const shop_id = req.headers.authorization; // Use 'authorization' from headers

  const {
    fontColor1,
    fontColor2,
    fontColor3,
    fontColor4,
    fontColor5,
    fontColor6,
    fontColor7,
    fontColor8,
    backgroundColor1,
    backgroundColor2,
    backgroundColor3,
    backgroundColor4,
    backgroundColor5
  } = req.body;

  // Check if a record with the same shop_id and section '2' already exists
  const checkExistingSql = 'SELECT id FROM component_look WHERE shop_id = ? AND section = ?';
  connection.query(checkExistingSql, [shop_id, '4'], (checkErr, checkResult) => {
    if (checkErr) {
      console.error(checkErr);
      return res.status(500).json({ message: 'Internal server error' });
    }

    if (checkResult.length > 0) {
      // If a record exists, delete the previous record
      const existingRecordId = checkResult[0].id;
      const deleteSql = 'DELETE FROM component_look WHERE id = ?';
      connection.query(deleteSql, [existingRecordId], (deleteErr, deleteResult) => {
        if (deleteErr) {
          console.error(deleteErr);
          return res.status(500).json({ message: 'Internal server error' });
        }
        // Insert the new record
        insertNewRecord();
      });
    } else {
      // If no record exists, insert the new record directly
      insertNewRecord();
    }
  });

  function insertNewRecord() {
    const sql = `INSERT INTO component_look (shop_id, section, font_colour1, font_colour2, font_colour3, font_colour4, font_colour5, font_colour6, font_colour7, font_colour8, background_colour1, background_colour2, background_colour3, background_colour4, background_colour5)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    connection.query(
      sql,
      [
        shop_id,
        '4',
        fontColor1,
        fontColor2,
        fontColor3,
        fontColor4,
        fontColor5,
        fontColor6,
        fontColor7,
        fontColor8,
        backgroundColor1,
        backgroundColor2,
        backgroundColor3,
        backgroundColor4,
        backgroundColor5
      ],
      (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: 'Internal server error' });
        }
        res.json({ message: 'Color selection added to the database successfully' });
      }
    );
  }
});

app.post('/color/selection/section/5', (req, res) => {
  const shop_id = req.headers.authorization; // Use 'authorization' from headers

  const {
    fontColor1,
    fontColor2,
    fontColor3,
    fontColor4,
    fontColor5,
    fontColor6,
    fontColor7,
    fontColor8,
    backgroundColor1,
    backgroundColor2,
    backgroundColor3,
    backgroundColor4,
    backgroundColor5
  } = req.body;

  // Check if a record with the same shop_id and section '2' already exists
  const checkExistingSql = 'SELECT id FROM component_look WHERE shop_id = ? AND section = ?';
  connection.query(checkExistingSql, [shop_id, '5'], (checkErr, checkResult) => {
    if (checkErr) {
      console.error(checkErr);
      return res.status(500).json({ message: 'Internal server error' });
    }

    if (checkResult.length > 0) {
      // If a record exists, delete the previous record
      const existingRecordId = checkResult[0].id;
      const deleteSql = 'DELETE FROM component_look WHERE id = ?';
      connection.query(deleteSql, [existingRecordId], (deleteErr, deleteResult) => {
        if (deleteErr) {
          console.error(deleteErr);
          return res.status(500).json({ message: 'Internal server error' });
        }
        // Insert the new record
        insertNewRecord();
      });
    } else {
      // If no record exists, insert the new record directly
      insertNewRecord();
    }
  });

  function insertNewRecord() {
    const sql = `INSERT INTO component_look (shop_id, section, font_colour1, font_colour2, font_colour3, font_colour4, font_colour5, font_colour6, font_colour7, font_colour8, background_colour1, background_colour2, background_colour3, background_colour4, background_colour5)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    connection.query(
      sql,
      [
        shop_id,
        '5',
        fontColor1,
        fontColor2,
        fontColor3,
        fontColor4,
        fontColor5,
        fontColor6,
        fontColor7,
        fontColor8,
        backgroundColor1,
        backgroundColor2,
        backgroundColor3,
        backgroundColor4,
        backgroundColor5
      ],
      (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: 'Internal server error' });
        }
        res.json({ message: 'Color selection added to the database successfully' });
      }
    );
  }
});

app.post('/color/selection/section/footer/color', (req, res) => {
  const shop_id = req.headers.authorization; // Use 'authorization' from headers

  const {
    fontColor1,
    fontColor2,
    fontColor3,
    fontColor4,
    fontColor5,
    fontColor6,
    fontColor7,
    fontColor8,
    backgroundColor1,
    backgroundColor2,
    backgroundColor3,
    backgroundColor4,
    backgroundColor5
  } = req.body;

  // Check if a record with the same shop_id and section '2' already exists
  const checkExistingSql = 'SELECT id FROM component_look WHERE shop_id = ? AND section = ?';
  connection.query(checkExistingSql, [shop_id, 'footer'], (checkErr, checkResult) => {
    if (checkErr) {
      console.error(checkErr);
      return res.status(500).json({ message: 'Internal server error' });
    }

    if (checkResult.length > 0) {
      // If a record exists, delete the previous record
      const existingRecordId = checkResult[0].id;
      const deleteSql = 'DELETE FROM component_look WHERE id = ?';
      connection.query(deleteSql, [existingRecordId], (deleteErr, deleteResult) => {
        if (deleteErr) {
          console.error(deleteErr);
          return res.status(500).json({ message: 'Internal server error' });
        }
        // Insert the new record
        insertNewRecord();
      });
    } else {
      // If no record exists, insert the new record directly
      insertNewRecord();
    }
  });

  function insertNewRecord() {
    const sql = `INSERT INTO component_look (shop_id, section, font_colour1, font_colour2, font_colour3, font_colour4, font_colour5, font_colour6, font_colour7, font_colour8, background_colour1, background_colour2, background_colour3, background_colour4, background_colour5)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    connection.query(
      sql,
      [
        shop_id,
        'footer',
        fontColor1,
        fontColor2,
        fontColor3,
        fontColor4,
        fontColor5,
        fontColor6,
        fontColor7,
        fontColor8,
        backgroundColor1,
        backgroundColor2,
        backgroundColor3,
        backgroundColor4,
        backgroundColor5
      ],
      (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: 'Internal server error' });
        }
        res.json({ message: 'Color selection added to the database successfully' });
      }
    );
  }
});

app.get("/custom/shop/coloring/display/section1", (req, res) => {
  const shop_id = req.headers.authorization;
  const section = '1'; // Set the desired section

  // Query to fetch records from component_look based on shop_id and section
  const selectQuery = `SELECT * FROM component_look WHERE shop_id = '${shop_id}' AND section = '${section}'`;

  connection.query(selectQuery, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    } else {
      if (result.length > 0) {
        // Data matching the criteria is found
        res.json({ shops: result });
      } else {
        // No matching data found
        res.status(404).json({ message: 'Data not found' });
      }
    }
  });
});

app.get("/custom/shop/coloring/display/section2", (req, res) => {
  const shop_id = req.headers.authorization;
  const section = '2'; // Set the desired section

  // Query to fetch records from component_look based on shop_id and section
  const selectQuery = `SELECT * FROM component_look WHERE shop_id = '${shop_id}' AND section = '${section}'`;

  connection.query(selectQuery, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    } else {
      if (result.length > 0) {
        // Data matching the criteria is found
        res.json({ shops: result });
      } else {
        // No matching data found
        res.status(404).json({ message: 'Data not found' });
      }
    }
  });
});

app.get("/custom/shop/coloring/display/section3", (req, res) => {
  const shop_id = req.headers.authorization;
  const section = '3'; // Set the desired section

  // Query to fetch records from component_look based on shop_id and section
  const selectQuery = `SELECT * FROM component_look WHERE shop_id = '${shop_id}' AND section = '${section}'`;

  connection.query(selectQuery, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    } else {
      if (result.length > 0) {
        // Data matching the criteria is found
        res.json({ shops: result });
      } else {
        // No matching data found
        res.status(404).json({ message: 'Data not found' });
      }
    }
  });
});

app.get("/custom/shop/coloring/display/section4", (req, res) => {
  const shop_id = req.headers.authorization;
  const section = '4'; // Set the desired section

  // Query to fetch records from component_look based on shop_id and section
  const selectQuery = `SELECT * FROM component_look WHERE shop_id = '${shop_id}' AND section = '${section}'`;

  connection.query(selectQuery, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    } else {
      if (result.length > 0) {
        // Data matching the criteria is found
        res.json({ shops: result });
      } else {
        // No matching data found
        res.status(404).json({ message: 'Data not found' });
      }
    }
  });
});

app.get("/custom/shop/coloring/display/section5", (req, res) => {
  const shop_id = req.headers.authorization;
  const section = '5'; // Set the desired section

  // Query to fetch records from component_look based on shop_id and section
  const selectQuery = `SELECT * FROM component_look WHERE shop_id = '${shop_id}' AND section = '${section}'`;

  connection.query(selectQuery, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    } else {
      if (result.length > 0) {
        // Data matching the criteria is found
        res.json({ shops: result });
      } else {
        // No matching data found
        res.status(404).json({ message: 'Data not found' });
      }
    }
  });
});

app.get("/custom/shop/coloring/display/section6", (req, res) => {
  const shop_id = req.headers.authorization;
  const section = '6'; // Set the desired section

  // Query to fetch records from component_look based on shop_id and section
  const selectQuery = `SELECT * FROM component_look WHERE shop_id = '${shop_id}' AND section = '${section}'`;

  connection.query(selectQuery, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    } else {
      if (result.length > 0) {
        // Data matching the criteria is found
        res.json({ shops: result });
      } else {
        // No matching data found
        res.status(404).json({ message: 'Data not found' });
      }
    }
  });
});

app.get("/custom/shop/coloring/display/footer", (req, res) => {
  const shop_id = req.headers.authorization;
  const section = 'footer'; // Set the desired section

  // Query to fetch records from component_look based on shop_id and section
  const selectQuery = `SELECT * FROM component_look WHERE shop_id = '${shop_id}' AND section = '${section}'`;

  connection.query(selectQuery, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    } else {
      if (result.length > 0) {
        // Data matching the criteria is found
        res.json({ shops: result });
      } else {
        // No matching data found
        res.status(404).json({ message: 'Data not found' });
      }
    }
  });
});

app.post('/section4/data', (req, res) => {
  const shop_id = req.headers.authorization; // Use 'authorization' instead of destructuring
  const { shop_blockhead1, shop_block1, shop_blockhead2, shop_block2, shop_blockhead3, shop_block3 } = req.body;

  const sql = `INSERT INTO section4 (shop_id, shop_blockhead1, shop_block1, shop_blockhead2, shop_block2, shop_blockhead3, shop_block3) VALUES (?, ?, ?, ?, ?, ?, ?)`;

  connection.query(sql, [shop_id, shop_blockhead1, shop_block1, shop_blockhead2, shop_block2, shop_blockhead3, shop_block3], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    } else {
      res.json({ message: 'Data inserted successfully' });
    }
  });
});

app.post('/section5/data', (req, res) => {
  const shop_id = req.headers.authorization; // Use 'authorization' instead of destructuring
  const { shop_blockhead1, shop_block1, shop_blockhead2, shop_block2, shop_blockhead3, shop_block3 } = req.body;

  const sql = `INSERT INTO section5 (shop_id, shop_blockhead1, shop_block1, shop_blockhead2, shop_block2, shop_blockhead3, shop_block3) VALUES (?, ?, ?, ?, ?, ?, ?)`;

  connection.query(sql, [shop_id, shop_blockhead1, shop_block1, shop_blockhead2, shop_block2, shop_blockhead3, shop_block3], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    } else {
      res.json({ message: 'Data inserted successfully' });
    }
  });
});
app.post('/section6/data', (req, res) => {
  const shop_id = req.headers.authorization; // Use 'authorization' instead of destructuring
  const { shop_blockhead1, shop_block1, shop_blockhead2, shop_block2, shop_blockhead3, shop_block3 } = req.body;

  const sql = `INSERT INTO section6 (shop_id, shop_blockhead1, shop_block1, shop_blockhead2, shop_block2, shop_blockhead3, shop_block3) VALUES (?, ?, ?, ?, ?, ?, ?)`;

  connection.query(sql, [shop_id, shop_blockhead1, shop_block1, shop_blockhead2, shop_block2, shop_blockhead3, shop_block3], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    } else {
      res.json({ message: 'Data inserted successfully' });
    }
  });
});
app.post('/section7/data', (req, res) => {
  const shop_id = req.headers.authorization; // Use 'authorization' instead of destructuring
  const { shop_blockhead1, shop_block1, shop_blockhead2, shop_block2, shop_blockhead3, shop_block3 } = req.body;

  const sql = `INSERT INTO section7 (shop_id, shop_blockhead1, shop_block1, shop_blockhead2, shop_block2, shop_blockhead3, shop_block3) VALUES (?, ?, ?, ?, ?, ?, ?)`;

  connection.query(sql, [shop_id, shop_blockhead1, shop_block1, shop_blockhead2, shop_block2, shop_blockhead3, shop_block3], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    } else {
      res.json({ message: 'Data inserted successfully' });
    }
  });
});

app.post('/footer/data/insert', (req, res) => {
  const shop_id = req.headers.authorization; // Use 'authorization' instead of destructuring
  const {companyname,
   slogan,
     insta,
     facebook,
     twiter,
     linkdin,
     phone,
    email,
     whatsapp,} = req.body;

  const sql = `INSERT INTO footer (shop_id, insta, facebook, twitter, linkdin, slogan, email, phone, whatsapp ) VALUES (?,?,?,?,?,?,?,?,?)`;

  connection.query(sql, [
    shop_id,
    companyname,
    slogan,
      insta,
      facebook,
      twiter,
      linkdin,
      phone,
     email,
      whatsapp, 
    ], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    } else {
      res.json({ message: 'Data inserted successfully' });
    }
  });
});


app.put('/section8/data', (req, res) => {
  const shop_id = req.headers.authorization; // Use 'authorization' instead of destructuring
  const { shop_blockhead1, shop_block1, shop_blockhead2, shop_block2,
  shop_blockhead3, shop_block3 } = req.body;

  const sql = `UPDATE section8 SET shop_blockhead1 = ?, shop_block1 = ?, shop_blockhead2 = ?, shop_block2 = ?, shop_blockhead3 = ?, shop_block3 = ? WHERE shop_id = ?`;

  connection.query(sql, [shop_blockhead1, shop_block1, shop_blockhead2, shop_block2, shop_blockhead3, shop_block3, shop_id], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    } else {
      res.json({ message: 'Order status updated successfully' });
    }
  });
});

app.put('/section9/data', (req, res) => {
  const shop_id = req.headers.authorization; // Use 'authorization' instead of destructuring
  const { shop_blockhead1, shop_block1, shop_blockhead2, shop_block2,
  shop_blockhead3, shop_block3 } = req.body;

  const sql = `UPDATE section9 SET shop_blockhead1 = ?, shop_block1 = ?, shop_blockhead2 = ?, shop_block2 = ?, shop_blockhead3 = ?, shop_block3 = ? WHERE shop_id = ?`;

  connection.query(sql, [shop_blockhead1, shop_block1, shop_blockhead2, shop_block2, shop_blockhead3, shop_block3, shop_id], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    } else {
      res.json({ message: 'Order status updated successfully' });
    }
  });
});

app.put('/section10/data', (req, res) => {
  const shop_id = req.headers.authorization; // Use 'authorization' instead of destructuring
  const { shop_blockhead1, shop_block1, shop_blockhead2, shop_block2,
  shop_blockhead3, shop_block3 } = req.body;

  const sql = `UPDATE section10 SET shop_blockhead1 = ?, shop_block1 = ?, shop_blockhead2 = ?, shop_block2 = ?, shop_blockhead3 = ?, shop_block3 = ? WHERE shop_id = ?`;

  connection.query(sql, [shop_blockhead1, shop_block1, shop_blockhead2, shop_block2, shop_blockhead3, shop_block3, shop_id], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    } else {
      res.json({ message: 'Order status updated successfully' });
    }
  });
});

app.put('/section11/data', (req, res) => {
  const shop_id = req.headers.authorization; // Use 'authorization' instead of destructuring
  const { shop_blockhead1, shop_block1, shop_blockhead2, shop_block2,
  shop_blockhead3, shop_block3 } = req.body;

  const sql = `UPDATE section11 SET shop_blockhead1 = ?, shop_block1 = ?, shop_blockhead2 = ?, shop_block2 = ?, shop_blockhead3 = ?, shop_block3 = ? WHERE shop_id = ?`;

  connection.query(sql, [shop_blockhead1, shop_block1, shop_blockhead2, shop_block2, shop_blockhead3, shop_block3, shop_id], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    } else {
      res.json({ message: 'Order status updated successfully' });
    }
  });
});

app.put('/section12/data', (req, res) => {
  const shop_id = req.headers.authorization; // Use 'authorization' instead of destructuring
  const { shop_blockhead1, shop_block1, shop_blockhead2, shop_block2,
  shop_blockhead3, shop_block3 } = req.body;

  const sql = `UPDATE section12 SET shop_blockhead1 = ?, shop_block1 = ?, shop_blockhead2 = ?, shop_block2 = ?, shop_blockhead3 = ?, shop_block3 = ? WHERE shop_id = ?`;

  connection.query(sql, [shop_blockhead1, shop_block1, shop_blockhead2, shop_block2, shop_blockhead3, shop_block3, shop_id], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    } else {
      res.json({ message: 'Order status updated successfully' });
    }
  });
});

app.get("/section4/display", (req, res) => {
  const shop_id = req.headers.authorization;

  // Query to fetch records from component_look based on shop_id and section
  const selectQuery = `SELECT * FROM section4 WHERE shop_id = '${shop_id}'`;

  connection.query(selectQuery, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    } else {
      if (result.length > 0) {
        // Data matching the criteria is found
        res.json({ shops: result });
      } else {
        // No matching data found
        res.status(404).json({ message: 'Data not found' });
      }
    }
  });
});

app.get("/section5/display", (req, res) => {
  const shop_id = req.headers.authorization;

  // Query to fetch records from component_look based on shop_id and section
  const selectQuery = `SELECT * FROM section5 WHERE shop_id = '${shop_id}'`;

  connection.query(selectQuery, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    } else {
      if (result.length > 0) {
        // Data matching the criteria is found
        res.json({ shops: result });
      } else {
        // No matching data found
        res.status(404).json({ message: 'Data not found' });
      }
    }
  });
});
app.get("/section6/display", (req, res) => {
  const shop_id = req.headers.authorization;

  // Query to fetch records from component_look based on shop_id and section
  const selectQuery = `SELECT * FROM section6 WHERE shop_id = '${shop_id}'`;

  connection.query(selectQuery, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    } else {
      if (result.length > 0) {
        // Data matching the criteria is found
        res.json({ shops: result });
      } else {
        // No matching data found
        res.status(404).json({ message: 'Data not found' });
      }
    }
  });
});

app.get("/custom/shop/display/footer", (req, res) => {
  const shop_id = req.headers.authorization;

  // Query to fetch records from component_look based on shop_id and section
  const selectQuery = `SELECT * FROM footer WHERE shop_id = '${shop_id}'`;

  connection.query(selectQuery, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    } else {
      if (result.length > 0) {
        // Data matching the criteria is found
        res.json({ shops: result });
      } else {
        // No matching data found
        res.status(404).json({ message: 'Data not found' });
      }
    }
  });
});

const botRules = [
  { input: 'What is Dropment?', output: 'Dropment is an all-in-one platform for selling online. It allows users to create stores, chat with customers, and more.' },
  { input: 'How can I create a store on Dropment?', output: 'You can create a store on Dropment by choosing a template or designing a custom one. Click on "Create Store" to get started.' },
  { input: 'Tell me about the free plan.', output: 'Dropment offers a free plan that allows users to explore the platform and start selling online without any initial cost.' },
  { input: 'What are Blinkfeeds?', output: 'Blinkfeeds are a type of stories feature, similar to Instagram stories, that allows users to showcase new products or achievements in a dynamic way.' },
  { input: 'Can I collaborate with friends on Dropment?', output: 'Yes, you can collaborate with friends to start a new shop and do business together on Dropment.' },
  { input: 'How does following shops work?', output: `By following shops on Dropment, you can stay updated on their latest products. It's a great way to discover and purchase new items.` },
  { input: 'What data does Dropment collect about customers?', output: 'Dropment collects customer data to help users improve their marketing strategies and enhance their products. This includes customer preferences and behaviors.' },
  { input: 'Is there customer support on Dropment?', output: `Yes, Dropment provides customer support. If you have any questions or issues, feel free to reach out, and we'll be happy to assist you.` },
  { input: 'Tell me more about store templates.', output: 'Dropment offers a variety of store templates that users can choose from to customize their online stores. It makes the process of setting up a store quick and easy.' },
  // Add more rules as needed
];

// Function to check if a string contains another string (case-insensitive)
const contains = (str, substr) => str.toLowerCase().includes(substr.toLowerCase());

// API endpoint to handle incoming messages
app.post('/api/messages', (req, res) => {
  const { userId, message } = req.body;

  // Save the message to the database
  const insertQuery = 'INSERT INTO bot_messages (user_id, message) VALUES (?, ?)';
  connection.query(insertQuery, [userId, message], (err, result) => {
    if (err) throw err;
    console.log('Message saved to the database');
  });

  // Bot logic with partial matching
  const matchedRule = botRules.find((rule) => contains(message, rule.input));
  const botResponse = matchedRule ? matchedRule.output : 'Sorry, I didn\'t understand that. How can I assist you?';

  res.json({ botResponse });
});


app.put('/color/selection/background/shop/color/add', (req, res) => {
  const shop_id = req.headers.authorization;
  const { backgroundColor1 } = req.body;

  const sql = 'UPDATE shops SET background_clr = ? WHERE shop_id = ?';

  connection.query(sql, [backgroundColor1, shop_id], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    } else {
      res.json({ message: 'Background color updated successfully' });
    }
  });
});


app.put('/custom/shop/finish/api', (req, res) => {
  const shop_id = req.headers.authorization;
  const { temp } = req.body;

  const sql = 'UPDATE shops SET temp = ? WHERE shop_id = ?';

  connection.query(sql, [temp, shop_id], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    } else {
      res.json({ message: 'Background color updated successfully' });
    }
  });
});

app.get('/visitors/:shopId', (req, res) => {
  const { shopId } = req.params;
  const query = 'SELECT SUM(visitors) AS totalVisits FROM shop_visits WHERE shop_id = ?';
  
  connection.query(query, [shopId], (err, results) => {
    if (err) {
      console.error('Error fetching total shop visits: ', err);
      res.status(500).json({ error: 'Failed to fetch total shop visits' });
    } else {
      const totalVisits = results[0].totalVisits || 0;
      res.json({ totalVisits });
    }
  });
});

app.get('/orders/dashboard/data/:shopId', (req, res) => {
  const shopId = req.params.shopId;
  const query = 'SELECT id FROM orders WHERE shop_id = ?';

  connection.query(query, [shopId], (error, results, fields) => {
    if (error) {
      res.status(500).json({ error: 'Error fetching data' });
      throw error;
    }
    res.send(results);
  });
});

app.get('/orders/dashboard/data/products/usd/:productId', (req, res) => {
  const productId = req.params.productId;
  const query = `SELECT usd FROM products WHERE id = ${productId}`;

  connection.query(query, (error, results, fields) => {
    if (error) throw error;
    res.send(results);
  });
});
app.get('/orders/dashboard/data/products/title/:productId', (req, res) => {
  const productId = req.params.productId;
  const query = 'SELECT title FROM products WHERE id = ?';

  connection.query(query, [productId], (error, results) => {
    if (error) {
      res.status(500).json({ error: 'Error fetching USD values' });
      throw error;
    }
    res.json(results);
  });
});
app.get('/countOrdersById/:id', (req, res) => {
  const id = req.params.id;
  const query = `SELECT COUNT(*) AS id_count FROM orders WHERE id = ?`;

  connection.query(query, [id], (error, results) => {
    if (error) {
      res.status(500).json({ error: 'Error fetching data' });
      throw error;
    }
    res.json(results);
  });
});

app.get('/mostOccurredID/shop/stats/:shopId', (req, res) => {
  const { shopId } = req.params;
  const query = 'SELECT id, COUNT(id) AS id_count FROM orders WHERE shop_id = ? GROUP BY id ORDER BY id_count DESC LIMIT 1';

  connection.query(query, [shopId], (error, results) => {
    if (error) {
      res.status(500).json({ error: 'Error fetching data' });
      throw error;
    }
    res.json(results);
  });
});

app.post('/updateVisits/:shopId', (req, res) => {
  const { shopId } = req.params;

  const checkQuery = 'SELECT * FROM shop_visits WHERE shop_id = ?';
  connection.query(checkQuery, [shopId], (checkErr, checkResults) => {
    if (checkErr) {
      console.error('Error checking shop visits: ', checkErr);
      res.status(500).json({ error: 'Failed to check shop visits' });
    } else {
      if (checkResults.length > 0) {
        // If shop_id exists, update visitors count
        const updateQuery = 'UPDATE shop_visits SET visitors = visitors + 1 WHERE shop_id = ?';
        connection.query(updateQuery, [shopId], (updateErr, updateResults) => {
          if (updateErr) {
            console.error('Error updating shop visits: ', updateErr);
            res.status(500).json({ error: 'Failed to update shop visits' });
          } else {
            res.json({ message: 'Shop visits updated successfully' });
          }
        });
      } else {
        // If shop_id doesn't exist, insert a new record
        const insertQuery = 'INSERT INTO shop_visits (shop_id, visit_date, visitors) VALUES (?, CURDATE(), 1)';
        connection.query(insertQuery, [shopId], (insertErr, insertResults) => {
          if (insertErr) {
            console.error('Error inserting shop visits: ', insertErr);
            res.status(500).json({ error: 'Failed to insert shop visits' });
          } else {
            res.json({ message: 'New shop visits record added successfully' });
          }
        });
      }
    }
  });
});

app.get('/totalMoneyMade/:shopId', (req, res) => {
  const shopId = req.params.shopId;
  const query = 'SELECT COUNT(id) as totalOrders FROM orders WHERE shop_id = ?';

  connection.query(query, [shopId], (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ totalOrders: results[0].totalOrders });
  });
});

app.get('/sales/data/7/days/:shopId', (req, res) => {
  const shopId = req.params.shopId;
  const today = new Date();
  const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days ago

  connection.query(
    'SELECT id, date, amount FROM orders WHERE shop_id = ? AND date BETWEEN ? AND ?',
    [shopId, sevenDaysAgo, today],
    (error, results) => {
      if (error) {
        res.status(500).json({ error: error.message });
      } else {
        res.json(results);
      }
    }
  );
});

app.get("/sales/data/for/date/:shopId", async (req, res) => {
  const shopId = req.params.shopId;
  const { filter } = req.query;

  let timeFilter;
  const today = new Date();

  switch (filter) {
    case "1year":
      timeFilter = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
      break;
    case "6months":
      timeFilter = new Date(today.getFullYear(), today.getMonth() - 6, today.getDate());
      break;
    case "1month":
      timeFilter = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
      break;
    case "7days":
      timeFilter = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case "1day":
      timeFilter = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      break;
    default:
      timeFilter = new Date(0); // No filter
      break;
  }

  const selectQuery = "SELECT id, COUNT(id) as count FROM orders WHERE shop_id = ? AND orderDateTime >= ? GROUP BY id";
  
  try {
    const orderCounts = await new Promise((resolve, reject) => {
      connection.query(selectQuery, [shopId, timeFilter], (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });

    // Extract IDs and counts
    const ids = orderCounts.map(result => result.id);
    const counts = orderCounts.reduce((acc, result) => {
      acc[result.id] = result.count;
      return acc;
    }, {});

    // Fetch USD from products table based on the retrieved IDs
    const productSelectQuery = "SELECT id, usd FROM products WHERE id IN (?)";
    connection.query(productSelectQuery, [ids], (error, products) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ error: error.message });
      }

      // Calculate the total sales for each product
      const salesData = products.map(product => ({
        id: product.id,
        totalUSD: product.usd * counts[product.id] // Multiply USD by count
      }));

      res.json(salesData);
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
});
app.get('/orders/product/admin/data/:shop_id', (req, res) => {
  const shopId = req.params.shop_id;
  let timeFilter = '';

  // Assuming 'timeInterval' is passed as a query parameter from frontend
  if (req.query.timeInterval) {
    const { timeInterval } = req.query;
    const currentDate = new Date();

    switch (timeInterval) {
      case '1year':
        currentDate.setFullYear(currentDate.getFullYear() - 1);
        break;
      case '6months':
        currentDate.setMonth(currentDate.getMonth() - 6);
        break;
      case '1month':
        currentDate.setMonth(currentDate.getMonth() - 1);
        break;
      case '1week':
        currentDate.setDate(currentDate.getDate() - 7);
        break;
      case '1day':
        currentDate.setDate(currentDate.getDate() - 1);
        break;
      default:
        break;
    }

    const formattedDate = currentDate.toISOString().split('T')[0];
    timeFilter = ` AND orderDatetime >= '${formattedDate}'`;
  }

  const query = `SELECT product, id, country, state, zipcode, city, streetadrs, name, Email, Phone, orderDatetime FROM orders WHERE shop_id = ?${timeFilter}`;
  
  connection.query(query, [shopId], (error, results) => {
    if (error) {
      res.status(500).json({ error: 'Failed to fetch orders' });
      return;
    }
    res.json(results);
  });
});
app.get('/products/admin/products/data/:shop_id', (req, res) => {
  const shopId = req.params.shop_id;
  const query = 'SELECT * FROM products WHERE shop_id = ?';

  connection.query(query, [shopId], (error, results) => {
    if (error) {
      res.status(500).json({ error: 'Failed to fetch products' });
      return;
    }
    res.json(results);
  });
});
app.delete('/products/delete/admin/data/:productId', (req, res) => {
  const productId = req.params.productId;
  const query = 'DELETE FROM products WHERE id = ?';

  connection.query(query, [productId], (error, results) => {
    if (error) {
      res.status(500).json({ error: 'Failed to delete product' });
      return;
    }
    res.json({ message: 'Product deleted successfully' });
  });
});

app.put('/update/inventory/admin/data/products', (req, res) => {
  const { productId, action } = req.body;

  let updateQuery = '';
  if (action === 'increase') {
    updateQuery = `
      UPDATE products 
      SET amount = CASE 
                     WHEN amount = 'Sold Out' THEN 1
                     ELSE amount + 1
                   END
      WHERE id = ?
    `;
  } else if (action === 'decrease') {
    updateQuery = `
      UPDATE products 
      SET amount = CASE 
                     WHEN amount > 1 THEN amount - 1
                     ELSE 'Sold Out'
                   END 
      WHERE id = ?
    `;
  }

  connection.query(updateQuery, [productId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error updating inventory.');
    }

    console.log(result);
    return res.status(200).send('Inventory updated successfully.');
  });
});
app.get('/products/total_inventory/:shop_id', (req, res) => {
  const { shop_id } = req.params;

  const query = `SELECT SUM(amount) AS total_inventory FROM products WHERE shop_id = ?`;

  connection.query(query, [shop_id], (err, results) => {
    if (err) {
      console.error('Error fetching total inventory: ' + err.stack);
      res.status(500).send('Error fetching total inventory');
      return;
    }
    res.json(results[0].total_inventory || 0); // Return total inventory or 0 if null
  });
});

app.listen(PORT, () => {
  console.log("Server started on port 8080");
});

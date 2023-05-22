const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const conn = require("../db/conn");
const mysql = require("mysql2/promise");
// const mysql = require("mysql2");
// const bcrypt = require('bcrypt');
const router=express.Router();
const util = require('util')


const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());



// const conn = mysql.createConnection({
//   host: "rds-mysql-db.cqvbprhxhwkj.ap-south-1.rds.amazonaws.com",
//   user: "admin",
//   password: "rohinimali1234",
//   database: "hospital_marketplace",
// });


//login api
// const bcrypt = require('bcrypt');

router.post('/login', async (req, res) => {
  
  const { email, password } = req.body;
   // Get the user with the matching email from patient table
   conn.query('SELECT * FROM patients WHERE email = ?', email, (err, patientResults) => {
    if (err) throw err;

    if (patientResults.length === 0) {
      // User not found in patient table, check providers table
      conn.query('SELECT * FROM providers WHERE email = ?', email, (err, providerResults) => {
        if (err) throw err;

        if (providerResults.length === 0) {
          // User not found in providers table either
          return res.status(401).json({ message: 'Invalid email or password' });
        }

        const user = providerResults[0];

        // Compare passwords
        if (password !== user.password) {
          // Incorrect password
          return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Login successful
        return res.json({ message: 'Login successful', name: user.name, provider_id: user.provider_id });
      });
    } else {
      const user = patientResults[0];

      // Compare passwords
      if (password !== user.password) {
        // Incorrect password
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Login successful
      return res.json({ message: 'Login successful', username: user.username, patient_id: user.patient_id });
    }
  });
});


// API endpoint for patient login
// app.post('/login', async (req, res) => {
//   const { email, password } = req.body;
//   let usertype;
//   console.log(email);
//   try {
//     // Get the user with the matching email from patient table
//     const [patientResults,] = await pool.execute('SELECT * FROM patients WHERE email = ?', [email]);
//     console.log(patientResults);
//     if (patientResults.length > 0) {
//       // User found in patient table
//       const user = patientResults[0];
//       usertype="patient";

//       // Compare passwords
//       if (password !== user.password) {
//         // Incorrect password
//         return res.status(401).json({ message: 'Invalid email or password' });
//       }

//       // Login successful
//       console.log(usertype);
//       console.log(patientResults);
//       res.json({ message: 'Login successful', username: user.username, patient_id: user.patient_id });
//     }

//     // User not found in patient table, check providers table
//     const [providerResults,] = await pool.execute('SELECT * FROM providers WHERE email = ?', [email]);
//     console.log(providerResults);
//     if (providerResults.length > 0) {
//       // User found in providers table
//       const user = providerResults[0];
//       usertype="provider";

//       // Compare passwords
//       if (password !== user.password) {
//         // Incorrect password
//         return res.status(401).json({ message: 'Invalid email or password' });
//       }

//       // Login successful
//       console.log(providerResults);
//       console.log(usertype);
//       res.json({ message: 'Login successful', name: user.name, provider_id: user.provider_id });
//     }

//     // User not found in providers table either
//     return res.status(401).json({ message: 'Invalid email or password' });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

//sign-up for patient

app.post("/register", (req, res) => {
  // Get data from request body
  const {
    firstname,
    lastname,
    email,
    dateofbirth,
    username,
    password,
  } = req.body;
  // Prepare SQL query to insert data into providers table
  const sql = `INSERT INTO patients (first_name,last_name,email,dateofbirth,username, password)
              VALUES (?,?, ?, ?, ?, ?)`;
  const values = [
    firstname,
    lastname,
    email,
    dateofbirth,
    username,
    password,
  ];
  // Execute the SQL query
  pool.query(sql, values, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error inserting data into database');
    } else {
      console.log('Data inserted into database');
      res.status(201).send('Data inserted into database');
    }
  });
});


// sign up for provider 

app.post("/providersignup", (req, res) => {
  // Get data from request body
  const {
    name,
    speciality,
    website,
    phone,
    age,
    address,
    city,
    state,
    zipcode,
    email,
    country,
    password
  } = req.body;
  // Prepare SQL query to insert data into providers table
  const sql = `INSERT INTO providers (name,
    speciality,
    website,
    phone,
    age,
    address,
    city,
    state,
    zipcode,
    email,
    country,
    password)
              VALUES (?,?, ?, ?, ?, ?,?,?,?,?,?,?)`;
  const values = [
    name,
    speciality,
    website,
    phone,
    age,
    address,
    city,
    state,
    zipcode,
    email,
    country,
    password
  ];
  // Execute the SQL query
  pool.query(sql, values, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error inserting data into database');
    } else {
      console.log('Data inserted into database');
      res.status(201).send('Data inserted into database');
    }
  });
});

//Update Provider Details
app.put("/providersignup/:id", (req, res) => {
  const id = req.params.id;
  // Get data from request body
  const {
    name,
    speciality,
    website,
    phone,
    age,
    address,
    city,
    state,
    zipcode,
    email,
    country,
    password
  } = req.body;
  // Prepare SQL query to update data in providers table
  const sql = `UPDATE providers SET name = ?, speciality = ?, website = ?, phone = ?, age = ?, address = ?, city = ?, state = ?, zipcode = ?, email = ?, country = ?, password = ? WHERE id = ?`;
  const values = [
    name,
    speciality,
    website,
    phone,
    age,
    address,
    city,
    state,
    zipcode,
    email,
    country,
    password,
    id
  ];
  // Execute the SQL query
  pool.query(sql, values, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error updating data in database');
    } else {
      console.log('Data updated in database');
      res.status(200).send('Data updated in database');
    }
  });
});





// // Start server
// const PORT = process.env.PORT || 9191;
// app.listen(PORT, () => {
//   console.log(`Server started on port ${PORT}`);
// });


module.exports=router;

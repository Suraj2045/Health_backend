const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const conn = require("../db/conn");
const mysql = require("mysql2/promise");
const router=express.Router();
const util = require('util')



const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());



//post api to add ratings
router.post('/reviews/:procedureId', (req, res) => {
    console.log(req.body)
    // Extract patientId and review data from the request body
    const { patientId, ratings, comment } = req.body;
  
    // Extract procedureId from the request parameters
    const { procedureId } = req.params;
    
  
    // Insert the new review and comment into the database
    conn.query(
      'INSERT INTO reviews (patient_id, procedure_id, rating, comment) VALUES (?, ?, ?, ?)',
      [patientId, procedureId, ratings, comment],
      (error, results) => {
        if (error) {
          console.error(error);
           res.status(500).json({ error: 'Internal server error' });
        } else {
          res.json({ message: 'Review added successfully' });
        }
      }
    );
  });



  // GET API to retrieve procedure table and booking history table data for a given patient ID
  router.get('/patient/:patientId', (req, res) => {
    const patientId = req.params.patientId;;
    conn.query(
      `SELECT p.*, bh.* FROM hospital_marketplace.procedures p INNER JOIN hospital_marketplace.booking_history bh ON bh.procedure_id = p.id WHERE bh.patient_id = ?`,
      [patientId],
      (error, results) => {
        if (error) {
          console.error(error);
          res.status(500).send('Error fetching procedure and booking data');
        } else {
          res.status(200).json(results);
        }
      }
    );
  });


  module.exports=router;

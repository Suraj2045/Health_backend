const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const conn = require("../db/conn");
const mysql = require('mysql2');
const multer = require('multer');
const fileUpload = require("express-fileupload");
const AWS = require('aws-sdk');
const fs = require('fs');
const router = express.Router();

const app = express();
app.use(express.json());
app.use(fileUpload());

// Middleware
app.use(cors());
app.use(bodyParser.json());



// Configure AWS SDK
AWS.config.update({
    accessKeyId: 'AKIA5CJJ45IUYKET2MFN',
    secretAccessKey: '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',
    region: 'ap-south-1'
});



// Create a Multer storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Set the destination folder for uploaded files
    },
    filename: function (req, file, cb) {
        const filename = Date.now() + "_" + req.body.pname + "_" + file.originalname;
        cb(null, filename); // Set the filename for the uploaded file
    },
});

// Create a Multer upload instance with the storage configuration
const upload = multer({ storage: storage });
//Add new procedure
// Use Multer middleware to handle the file upload


// Provider doctor search
router.get("/provider/doctor/search/:selectedoctorlist", (req, res) => {
    const { selectedoctorlist } = req.params;
    console.log(selectedoctorlist);
    // Query the database for the procedure with the specified provider ID and procedure name
    conn.query(
        `SELECT *
        FROM doctors
        WHERE id = ? `,
        [selectedoctorlist],
        (error, results) => {
            console.log(results);
            if (error) {
                // Handle any errors that occurred during the query
                console.error(error);
                res.status(500).send({ success: false, error: "An error occurred" });
            } else {

                res.json({ success: true, doctor: results });
            }
        }
    );
});

// Provider doctor search
router.get("/provider/doctors/search/:providerId", (req, res) => {
    const { providerId } = req.params;
    console.log(providerId);
    // Query the database for the procedure with the specified provider ID and procedure name
    conn.query(
        `SELECT *
      FROM doctors
      WHERE provider_id = ?`,
        [providerId],
        (error, results) => {
            console.log(results);
            if (error) {
                // Handle any errors that occurred during the query
                console.error(error);
                res.status(500).send({ success: false, error: "An error occurred" });
            } else {

                res.json({ success: true, doctors: results });
            }
        }
    );
});

app.post('/patient/signup', (req, res) => {
  const { email, password, name, age, gender, address, phone } = req.body;

  // Query the database to check if the email is already registered
  conn.query(
    'SELECT * FROM patients WHERE email = ?',
    [email],
    (error, results) => {
      if (error) {
        console.error(error);
        res.status(500).send({ success: false, error: 'An error occurred' });
      } else {
        // Check if the email is already registered
        if (results.length > 0) {
          res.status(409).send({ success: false, error: 'Email already registered' });
        } else {
          // Insert the new patient into the database
          conn.query(
            'INSERT INTO patients (email, password, name, age, gender, address, phone) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [email, password, name, age, gender, address, phone],
            (error, results) => {
              if (error) {
                console.error(error);
                res.status(500).send({ success: false, error: 'An error occurred' });
              } else {
                res.status(200).send({ success: true, message: 'Patient signup successful' });
              }
            }
          );
        }
      }
    }
  );
});

// API endpoint for patient update
app.put('/api/patient/:patientId', (req, res) => {
  const patientId = req.params.patientId;
  const { email, password, name, age, gender, address, phone } = req.body;

  // Update the patient information in the database
  conn.query(
    'UPDATE patients SET email = ?, password = ?, name = ?, age = ?, gender = ?, address = ?, phone = ? WHERE id = ?',
    [email, password, name, age, gender, address, phone, patientId],
    (error, results) => {
      if (error) {
        console.error(error);
        res.status(500).send({ success: false, error: 'An error occurred' });
      } else {
        res.status(200).send({ success: true, message: 'Patient information updated' });
      }
    }
  );
});

////////provider update query////////
router.put("/providerprofile/:id", (req, res) => {
    try {
         const {
      name,
      speciality,
      website,
      phone,
      address,
      city,
      state,
      zipcode,
      email,
      country
    } = req.body;
      const provider_id = req.params.id;     
          conn.query(
            "UPDATE providers SET name = ?, speciality = ?, website = ?, phone = ?, address = ?, city = ?, state = ?, zipcode = ?, email = ?, country = ? WHERE provider_id = ?",
               [
                name,
                speciality,
                website,
                phone,
                address,
                city,
                state,
                zipcode,
                email,
                country,
                provider_id
              ],
            
            (error, results) => {
              if (error) {
                console.error(error);
                res.status(500).json({ success: false, error: "An error occurred during procedure update" });
              } else {
                res.json({ success: true, procedure: results });
              }
            }
          );
      //   }
      // });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  });


//////////PROVIDER GET QUERY THROUGH SINGLE ID///////return empty array provider
router.get('/providerprofile/:provider_id', (req, res) => {
    const provider_id = req.params.provider_id;
    console.log(provider_id);
  
    // Query the database for the provider with the specified provider_id
    conn.query(
      `SELECT * FROM providers WHERE provider_id = ?`,
      [provider_id],
      (error, results) => {
        if (error) {
          // Handle any errors that occurred during the query
          console.error(error);
          res.status(500).send({ success: false, error: "An error occurred" });
        } else {
          res.json({ success: true, provider: results });
        }
      }
    );
  });
  
  router.get('/providerprofiles/:procedure_id', (req, res) => {
    const id = req.params.procedure_id;
    console.log(id);
  
    // Query the database for the provider with the specified provider_id
    conn.query(
      `SELECT *
      FROM doctors
      JOIN procedures ON doctors.id = procedures.doctor_id
      WHERE procedures.id = ?;
      `,
      [id],
      (error, results) => {
        if (error) {
          // Handle any errors that occurred during the query
          console.error(error);
          res.status(500).send({ success: false, error: "An error occurred" });
        } else {
          res.json({ success: true, doctor: results });
        }
      }
    );
  });

/////PROVIDER'S DOCTOR CREATE QUERY////////, upload.single('photo')
router.post("/Doctor/AddNew", (req, res) => {
    try {
        const {
            name,
            email,
            specialty,
            bio,
            created_at,
            updated_at,
            phone
        } = req.body;
    //     const file = req.file;
    // if (!file) {
    //   return res.status(400).send('No files were uploaded.');
    // }

    // if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.mimetype)) {
    //   return res.status(400).send("This format is not allowed, please upload file with '.png', '.gif', '.jpg'");
    // }

    // // Set maximum allowed file size in bytes (e.g., 2MB)
    // const maxSize = 2 * 1024 * 1024;
    // if (file.size > maxSize) {
    //   return res.status(400).send('The uploaded image exceeds the maximum allowed file size.');
    // }

    // const uploadPath = file.path;

    // // Create an S3 instance
    // const s3 = new AWS.S3();
    // // Read the image file from local disk
    // const imageFile = fs.readFileSync(uploadPath);
    // // Set the S3 bucket name and key (file name)
    // const bucketName = 'healthcaremarketplace';
    // const keyName = file.filename;
    // // Set the S3 parameters
    // const params = {
    //   Bucket: bucketName,
    //   Key: keyName,
    //   Body: imageFile,
    // };

    // // Upload the image to S3
    // const s3UploadResult =  s3.upload(params).promise();
    // const image_url = s3UploadResult.Location;
    // const imagePath = image_url.toString();

        const values = [ name,email,phone,specialty,bio,created_at,updated_at ];

        conn.query(`INSERT INTO doctors(name, email, phone, specialty, bio, created_at, updated_at) VALUES (?,?, ?, ?, ?, ?, ?, ?)`, values, (err, result) => {
            if (err) {
                console.error(err);
                res.status(500).send('Error inserting data into database');
            } else {
                console.log('Data inserted into database');
                res.status(201).send('Data inserted into database');
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
});

///////DOCTOR UPDATE QUERYY////////

router.put("/doctordetails/:id",upload.none(), (req, res) => {
    try {
      const { name, email, phonephone, specialty, bio, created_at, updated_at } = req.body;
      const doctor_id = req.params.id;
  
      // Update the database query
      conn.query(
        "UPDATE doctors SET name=?, email=?, phone=?, specialty=?, bio=?, created_at=?, updated_at=? WHERE id=?",
        [name, email, phone, specialty, bio, created_at, updated_at, doctor_id],
        (error, results) => {
          if (error) {
            console.error(error);
            res.status(500).json({ success: false, error: "An error occurred during procedure update" });
          } else {
            res.json({ success: true, procedure: results });
          }
        }
      );
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  });
  

////DOCTOR DELETE QUERY//////
router.delete('/doctordelete/:id', (req, res) => {
    const id = req.params.id;

    // Construct the SQL DELETE statement
    const sql = `DELETE FROM doctors WHERE id = ${id}`;

    conn.query(sql, (error, results) => {
        if (error) {
            console.error(error);
            res.status(500).send('Server error');
        } else {
            res.send('Doctor deleted successfully');
        }
    });
});


////UPDATE/CHANGE PROVIDER PASSWORD///////
router.put("/providerchangepass/:id", (req, res) => {
    const provider_id = req.params.id;
    const { oldpassword, newpassword } = req.body;

    conn.query('SELECT password FROM providers WHERE provider_id = ?', [provider_id], (error, result) => {
        if (error) {
            console.error(error);
            return res.status(500).send('Server error');
        }

        if (result.length === 0) {
            return res.status(404).send('Provider not found');
        }

        const storedPassword = result[0].password;

        if (oldpassword === storedPassword) {
            conn.query('UPDATE providers SET password = ? WHERE provider_id = ?', [newpassword, provider_id], (error) => {
                if (error) {
                    console.error(error);
                    return res.status(500).send('Server error');
                }

                res.send('Password updated successfully');
            });
        } else {
            return res.status(400).send('Old password does not match');
        }
    });
});




module.exports = router;
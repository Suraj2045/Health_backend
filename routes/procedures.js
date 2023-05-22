const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const conn = require("../db/conn");
const mysql = require('mysql2');
const multer = require('multer');

const fileUpload = require("express-fileupload");

const AWS = require('aws-sdk');
const fs = require('fs');
const router=express.Router();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database connection
// const conn = mysql.createconn({
//   host: "rds-mysql-db.cqvbprhxhwkj.ap-south-1.rds.amazonaws.com",
//   user: "admin",
//   password: "rohinimali1234",
//   database: "hospital_marketplace",
// });

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
// router.post("/Procedure/adddataImages", upload.single('photo'), async (req, res) => {
//   try {
//     const { pname, description, price, doctor_id, duration, providerId, speciality, section } = req.body;
//     const file = req.file;
//     if (!file) {
//       return res.status(400).send('No files were uploaded.');
//     }

//     if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.mimetype)) {
//       return res.status(400).send("This format is not allowed, please upload file with '.png', '.gif', '.jpg'");
//     }

//     // Set maximum allowed file size in bytes (e.g., 2MB)
//     const maxSize = 2 * 1024 * 1024;
//     if (file.size > maxSize) {
//       return res.status(400).send('The uploaded image exceeds the maximum allowed file size.');
//     }

//     const uploadPath = file.path;

//     // Create an S3 instance
//     const s3 = new AWS.S3();
//     // Read the image file from local disk
//     const imageFile = fs.readFileSync(uploadPath);
//     // Set the S3 bucket name and key (file name)
//     const bucketName = 'healthcaremarketplace';
//     const keyName = file.filename;
//     // Set the S3 parameters
//     const params = {
//       Bucket: bucketName,
//       Key: keyName,
//       Body: imageFile,
//     };

//     // Upload the image to S3
//     const s3UploadResult = await s3.upload(params).promise();
//     const image_url = s3UploadResult.Location;
//     const imagePath = image_url.toString();

//     conn.query(
//       "INSERT INTO procedures (pname, description, doctor_id, price, duration, provider_id, speciality, section, procedure_image) VALUES (?,?,?,?,?,?,?,?,?)",
//       [pname, description, doctor_id, price, duration, providerId, speciality, section, imagePath],
//       (error, results) => {
//         console.log(results);
//         if (error) {
//           console.error(error);
//           res.status(500).send({ success: false, error: "An error occurred" });
//         } else {
//           res.json({ success: true, procedure: results });
//         }
//       }
//     );
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, error: "Internal server error" });
//   }
// });

router.post("/Procedure/adddataImages", upload.single('photo'), async (req, res) => {
  try {
    const { pname, description, price, doctor_id, duration, provider_id, discount,speciality, section } = req.body;
    const file = req.file;
    if (!file) {
      return res.status(400).send('No files were uploaded.');
    }

    if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.mimetype)) {
      return res.status(400).send("This format is not allowed, please upload file with '.png', '.gif', '.jpg'");
    }

    // Set maximum allowed file size in bytes (e.g., 2MB)
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      return res.status(400).send('The uploaded image exceeds the maximum allowed file size.');
    }

    const uploadPath = file.path;

    // Create an S3 instance
    const s3 = new AWS.S3();
    // Read the image file from local disk
    const imageFile = fs.readFileSync(uploadPath);
    // Set the S3 bucket name and key (file name)
    const bucketName = 'healthcaremarketplace';
    const keyName = file.filename;
    // Set the S3 parameters
    const params = {
      Bucket: bucketName,
      Key: keyName,
      Body: imageFile,
    };

    // Upload the image to S3
    const s3UploadResult = await s3.upload(params).promise();
    const image_url = s3UploadResult.Location;
    const imagePath = image_url.toString();

    // Check if the doctor_id exists in the doctors table
    conn.query("SELECT id FROM doctors WHERE id = ?", [doctor_id], (error, results) => {
      if (error) {
        console.error(error);
        return res.status(500).send({ success: false, error: "An error occurred" });
      }
      // if (results.length === null) {
      //   return res.status(400).send({ success: false, error: "Invalid doctor_id" });
      // }

      // Insert the data into the procedures table
      conn.query(
        "INSERT INTO procedures (pname, description, doctor_id, price,discount, duration, provider_id, speciality, section, procedure_image) VALUES (?,?,?,?,?,?,?,?,?,?)",
        [pname, description, doctor_id, price, duration,discount, provider_id, speciality, section, imagePath],
        (error, results) => {
          if (error) {
            console.error(error);
            return res.status(500).send({ success: false, error: "An error occurred" });
          }
          res.json({ success: true, procedure: results });
        }
      );
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});


// procedure search by Speciality on Home 
router.post("/Procedure/speciality/searchProcedurehome",  (req, res) => {
  const { procedure, location, speciality } = req.body;

  // Validate input
  if (!procedure || !location || !speciality) {
    res.status(400).json({ success: false, error: "Missing required parameters" });
    return;
  }

  try {
    // Query the database for procedures with matching name and provider city
    conn.query(
      `SELECT p.id, p.pname, p.price, p.description, p.duration,p.speciality
            p.doctor_name AS doctor_name,
            pr.provider_id  AS provider_id, pr.name AS provider_name, pr.address, pr.city, pr.state, pr.zipcode, pr.phone, pr.website,
            r.id AS review_id, r.rating, r.comment
     FROM procedures p
     LEFT JOIN providers pr ON p.provider_id =  pr.provider_id 
     LEFT JOIN reviews r ON p.id = r.procedure_id
     WHERE p.pname LIKE ? AND pr.city LIKE ? AND p.speciality LIKE ?`,
      [`%${procedure}%`, `%${location}%`, `%${speciality}%`],
      (error, results) => { 
        console.log(results);

        if(results.length===0){res.status(400).send({ success: false, error:"procedure not found" });}

        if (error) {
          // Handle any errors that occurred during the query
          console.error(error);
          res.status(500).send({ success: false, error: "An error occurred" });
        } else {
         
          res.json({ success: true, procedure: results });
        }
      }
    );
     } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Failed to fetch procedures" });
  }

});

//  procedure search free search
router.post("/Procedure/searchProcedurehome", (req, res) => {
  const { procedure } = req.body;
  console.log(procedure);
  // Query the database for procedures with matching name and provider city
  conn.query(
    `SELECT * from procedures WHERE pname LIKE ? `,
    [`%${procedure}%`],
    (error, results) => {
      console.log(results);
      if (error) {
        console.error(error);
        res.status(500).send({ success: false, error: "An error occurred" });
      } else {
        res.json({ success: true, procedure: results });
      }
    }
  );
});

// Provider procedure search
router.get("/provider/procedures/search/:selectedProcedurelist",  (req, res) => {
  const { selectedProcedurelist } = req.params;
  console.log(selectedProcedurelist);
    // Query the database for the procedure with the specified provider ID and procedure name
     conn.query(
      `SELECT *
      FROM procedures
      WHERE id = ? `,
      [selectedProcedurelist],
      (error, results) => { 
        console.log(results);
        if (error) {
          // Handle any errors that occurred during the query
          console.error(error);
          res.status(500).send({ success: false, error: "An error occurred" });
        } else {
         
          res.json({ success: true, procedure: results });
        }
      }
    ); 
});

// Provider procedure search
router.get("/provider/procedure/search/:providerId", (req, res) => {
  const { providerId } = req.params;
  console.log(providerId);
    // Query the database for the procedure with the specified provider ID and procedure name
  conn.query(
    `SELECT *
    FROM procedures
    WHERE provider_id = ?`,
    [providerId],
    (error, results) => { console.log(results);
      if (error) {
        // Handle any errors that occurred during the query
        console.error(error);
        res.status(500).send({ success: false, error: "An error occurred" });
      } else {
       
        res.json({ success: true, procedure: results });
      }
    }
  );
});


// Update an existing procedure in the database  , upload.single('photo'),

router.put("/Procedure/update/:id", upload.none(), async (req, res) => {
  try {
    const { pname, description, price, doctor_id, duration, provider_id, discount, speciality, section } = req.body;
    const procedureId = req.params.id;
    // const file = req.file;

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

    try {
      // Upload the image to S3
      // const s3UploadResult = await s3.upload(params).promise();
      // const imagePath = s3UploadResult.Location.toString();

      // Check if the doctor_id exists in the doctors table
      conn.query(
        "SELECT * FROM doctors WHERE id = ?",
        [doctor_id],
        (doctorError, doctorResults) => {
          if (doctorError || doctorResults.length === 0) {
            res.status(400).json({ success: false, error: "Invalid doctor_id" });
          } else {
            // Check if the provider_id exists in the providers table
            conn.query(
              "SELECT * FROM providers WHERE id = ?",
              [provider_id],
              (providerError, providerResults) => {
                if (providerError || providerResults.length === 0) {
                  res.status(400).json({ success: false, error: "Invalid provider_id" });
                } else {
                  // Update the procedure record with the validated foreign key values
                  conn.query(
                    "UPDATE procedures SET pname=?, description=?, price=?, doctor_id=?, duration=?, provider_id=?, discount=?, speciality=?, section=?, procedure_image=? WHERE id=?",
                    [pname, description, price, doctor_id, duration, provider_id, discount, speciality, section, imagePath, procedureId],
                    (updateError, updateResults) => {
                      if (updateError) {
                        console.error(updateError);
                        res.status(500).json({ success: false, error: "An error occurred during procedure update" });
                      } else {
                        res.json({ success: true, procedure: updateResults });
                      }
                    }
                  );
                }
              }
            );
          }
        }
      );
    } catch (uploadError) {
      console.error(uploadError);
      res.status(500).json({ success: false, error: "An error occurred during image upload" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});








// Delete the procedure
router.delete("/procedures/delete/:id", (req, res) => {
  const id = req.params.id;
  
  // Check if the procedure exists in the database
  conn.query(
    "SELECT * FROM procedures WHERE id = ?",
    [id],
    (error, results) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ success: false, error: "Internal server error" });
      }

      if (results.length === 0) {
        return res.status(404).json({ success: false, error: "Procedure not found" });
      }

      // Delete the related records from the booking_history table
      conn.query("DELETE FROM booking_history WHERE procedure_id = ?", [id], (error) => {
        if (error) {
          console.error(error);
          return res.status(500).json({ success: false, error: "Internal server error" });
        }

        // Delete the procedure from the procedures table
        conn.query("DELETE FROM procedures WHERE id = ?", [id], (error) => {
          if (error) {
            console.error(error);
            return res.status(500).json({ success: false, error: "Internal server error" });
          }

          console.log("Procedure deleted");
          res.status(200).json({ success: true });
        });
      });
    }
  );
});



// Start server
// const PORT = process.env.PORT || 8081;
// app.listen(PORT, () => {
//   console.log(`Server started on port ${PORT}`);
// });

module.exports=router;
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const conn = require("../db/conn");
const AWS = require('aws-sdk');
// const router = require('./procedures');
const cors = require("cors");
const router =express.Router();

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use(bodyParser.json());

AWS.config.update({
    accessKeyId: 'AKIA5CJJ45IUYKET2MFN',
    secretAccessKey: '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',
    region: 'ap-south-1'
  });

router.post('/messages', (req, res) => {
  const message = req.body.message;

  fs.appendFile('messages.txt', message + '\n', (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error saving message');
    }

    // Create an S3 instance
    const s3 = new AWS.S3();
    // Read the logging file from local disk
    const loggingFile = fs.readFileSync("messages.txt");
    // Set the S3 bucket name and key (file name)
    const bucketName = 'healthcaremarketplace';
    const keyName = "messages.txt";
    // Set the S3 parameters
    const params = {
      Bucket: bucketName,
      Key: keyName,
      Body: loggingFile,
     // ACL: 'public-read', // Optional: Set the ACL for the uploaded file
    };
    let logging_url = "";
    // Upload the logging to S3
    s3.upload(params, (err, data) => {
      if (err) {
        console.error('Error uploading logging:', err);
      } else {
        console.log('logging uploaded successfully. File URL:', data.Location);
        image_url = data.Location;
      }
    })

    console.log('Message saved:', message);
    res.sendStatus(200);
  });
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

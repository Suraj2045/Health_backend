require("dotenv").config();
const express = require("express");
const app = express();
require("./db/conn");
const mysql = require('mysql2/promise');
const cors = require("cors");
const router = require("./routes/router")
const register = require("./routes/register")
const procedures = require("./routes/procedures")
<<<<<<< HEAD
const doctor = require("./routes/doctors")
// const logging= require("./routes/logging")
=======
const review = require("./routes/review")
>>>>>>> e266354cb297e39b3d03db385dde106caa94985e
const port = 8004;

app.use(express.json());
app.use(cors());

app.use("/uploads",express.static("./uploads"))

<<<<<<< HEAD
app.use(router);
app.use(register);
app.use(procedures);
app.use(doctor);
// app.use(logging);
=======
app.use(router)
app.use(register)
app.use(procedures)
app.use(review)
>>>>>>> e266354cb297e39b3d03db385dde106caa94985e

app.listen(port,()=>{
    console.log("server start",port)
})
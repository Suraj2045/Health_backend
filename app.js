require("dotenv").config();
const express = require("express");
const app = express();
require("./db/conn");
const mysql = require('mysql2/promise');
const cors = require("cors");
// const router = require("./routes/router")
const register = require("./routes/register")
const procedures = require("./routes/procedures")
const doctor = require("./routes/doctors")
// const logging= require("./routes/logging")
const port = 8080;

app.use(express.json());
app.use(cors());

app.use("/uploads",express.static("./uploads"))

// app.use(router);
app.use(register);
app.use(procedures);
app.use(doctor);
// app.use(logging);

app.listen(port,()=>{
    console.log("server start",port)
})
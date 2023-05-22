// const mysql = require("mysql2");
const mysql = require('mysql2');




const conn =  mysql.createConnection({
    host: "rds-mysql-db.cqvbprhxhwkj.ap-south-1.rds.amazonaws.com",
    user: "admin",
    password: "rohinimali1234",
    database: "hospital_marketplace",
});

conn.connect ((error)=>{
    if(error) {console.log("error:",error)}
    console.log("connected !")
});

module.exports = conn
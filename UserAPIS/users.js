const exp = require("express");
const userApp = exp.Router();
userApp.use(exp.json());
const mysql = require("mysql2/promise");
const db = require('../config').db;



  
userApp.post("/signup", async (req, res) => {
  try {
    // Retrieve the user object from the request body
    let dataObj = req.body;
    // Attempt to connect to the MySQL database
    let connection = await mysql.createConnection(db);
    // Create a SQL query for retrieving all the existing diseases and their symptoms from the database
    let sql = `INSERT INTO users_db( username,password,email)  VALUES (?,?,?)`;
    values = [dataObj.username, dataObj.password,dataObj.email];
    await connection.query(sql, values);
    // Execute the SQL query and retrieve the result

    // Close the database connection
    await connection.end();
    // Send a 200 status with the success message
    res.status(200).send("Insertion Successful");
  } catch (err) {
    // If there is an error, log the error and send a 500 internal server error status
    console.error(err.message);
    return res.status(500).send(err.message);
  }
});



  
userApp.post("/login", async (req, res) => {
    try {
      // Retrieve the user object from the request body
      let dataObj = req.body;
      // Attempt to connect to the MySQL database
      let connection = await mysql.createConnection(db);
      // Create a SQL query for retrieving all the existing diseases and their symptoms from the database
      let sql = `INSERT INTO disease( disease_id,disease_name)  VALUES (?,?)`;
      values = [dataObj.disease_id, dataObj.disease_name];
      await connection.query(sql, values);
      // Execute the SQL query and retrieve the result
      
      // Close the database connection
      await connection.end();
      // Send a 200 status with the success message
      res.status(200).send("Insertion Successful");
    } catch (err) {
      // If there is an error, log the error and send a 500 internal server error status
      console.error(err.message);
      return res.status(500).send(err.message);
    }
  });


  module.exports=userApp;
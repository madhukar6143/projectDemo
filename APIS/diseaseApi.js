const exp = require("express");
const diseaseApp = exp.Router();
diseaseApp.use(exp.json());
const mysql = require("mysql2/promise");
const db = require('../config').db;


// Define the route and the HTTP method to handle
diseaseApp.get("/get-disease-master", async (req, res) => {
  try {
    // Attempt to connect to the MySQL database
    let connection = await mysql.createConnection(db);

    // Create a SQL query for retrieving all the existing diseases and their symptoms from the database
    let sql = 'SELECT * FROM disease order by disease_id';

    // Execute the SQL query and retrieve the result
    let [result] = await connection.query(sql);

    // Close the database connection
    await connection.end();

    // Send a 200 status with the success message and the retrieved result
    res.status(200).send(result);
  } catch (err) {
    // If there is an error, log the error and send a 500 internal server error status
    return res.status(500).send({message:err.message});
  }
});

  
diseaseApp.post("/create-disease-master", async (req, res) => {
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
    res.status(200).send({message:"Disease created Successful"});
  } catch (err) {
    // If there is an error, log the error and send a 500 internal server error status

    return res.status(200).send({message:err.message});
  }
});

diseaseApp.put("/update-disease-master", async (req, res) => {
  try {
    // Retrieve the user object from the request body
    let dataObj = req.body;

    // Attempt to connect to the MySQL database
    let connection = await mysql.createConnection(db);

    // Create a SQL query for updating the disease's name in the database based on its ID
    let sql = `UPDATE  disease set disease_name= "${dataObj.diseaseName}"  where disease_id=${dataObj.disease_id}`;

    // Execute the SQL query
    await connection.query(sql);
    // Close the database connection
    await connection.end();
    // Send a 200 status with the success message
    res.status(200).send({message:"DiseaseName Updated Successful"});
  } catch (err) {
    // If there is an error, log the error and send a 500 internal server error status
    console.error(err.message);
    return res.status(500).send(err.message);
  }
});


diseaseApp.delete("/delete-disease-master/:id", async (req, res) => {
  try {
    // Retrieve the ID of the disease to delete from the URL parameter
    let disease_id = req.params.id;
    // Attempt to connect to the MySQL database
    let connection = await mysql.createConnection(db);
    // Create a SQL query for deleting the disease from the database based on its ID
    let sql = `DELETE  from disease  where disease_id=${disease_id}`;
    // Execute the SQL query
    await connection.query(sql);
    // Close the database connection
    await connection.end();
    // Send a 200 status with the success message
    res.status(200).send({message:"Disease Deleted Successful"});
  } catch (err) {
    // If there is an error, log the error and send a 500 internal server error status
    return res.status(500).send({message:err.message});
  }
});


module.exports = diseaseApp;

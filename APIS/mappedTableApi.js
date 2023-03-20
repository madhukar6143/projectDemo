const exp = require("express");
const mappedTableApp = exp.Router();
mappedTableApp.use(exp.json());
const mysql = require("mysql2/promise");
const db = require('../config').db;

mappedTableApp.get("/get-mapped-table", async (req, res) => {
    try {
      // Attempt to connect to the MySQL database
      let connection = await mysql.createConnection(db);
      // Create a SQL query for retrieving all the existing diseases and their symptoms from the database
      let sql = `SELECT disease_id,JSON_ARRAYAGG(symptom_ids) as symptom_ids FROM mapped_table group by disease_id;`;
      // Execute the SQL query and retrieve the result
      const [objects] = await connection.execute(sql);
      // Check if the disease with the same symptoms already exists in the database
      res.status(200).send(objects);
    } catch (err) {
      // If there is an error, log the error and send a 500 internal server error status
      console.error(err.message);
      return res.status(500).send(err.message);
    }
  });

// This is a POST endpoint that receives a request to insert a new disease with its symptoms
// The endpoint is defined with the async function
mappedTableApp.post("/create-disease", async (req, res) => {
    try {
      // Retrieve the user object from the request body
      const { disease_id, symptom } = req.body;
      // Extract the disease,symptoms from the user object and store in a variable

      // Declare a variable for storing duplicate disease id
      let duplicate;
      // Attempt to connect to the MySQL database
      let connection = await mysql.createConnection(db);
      // Create a SQL query for retrieving all the existing diseases and their symptoms from the database
      let sql = `SELECT disease_id,JSON_ARRAYAGG(symptom_ids) as symptom_ids FROM mapped_table group by disease_id;`;
      // Execute the SQL query and retrieve the result
      const [objects] = await connection.execute(sql);

      // Check if the disease with the same symptoms already exists in the database

      const isEqual = objects.some((obj) => {
        // If the number of symptoms is not equal to the number of symptoms in the user object, return false
        if (obj.symptom_ids.length !== symptom.length) {
          return false;
        }
        // Loop through all the symptoms in the database
        for (let i = 0; i < obj.symptom_ids.length; i++) {
          // If the symptom in the database is not the same as the symptom in the user object, return false
          if (obj.symptom_ids[i] != symptom[i]) {
            return false;
          }
        }
        // If the disease with the same symptoms is found, store its ID in the duplicate variable and return true
        duplicate = obj.disease_id;
        return true;
      });
      // If the disease with the same symptoms already exists in the database, return a 409 conflict status with the duplicate disease id
      if (isEqual) {
        return res.status(409).send({ "with same symptoms diasease found": duplicate });
      }
      // Loop through all the symptoms in the user object and insert them into the database
      for (let i = 0; i < symptom.length; i++) {
        sql =
          "INSERT INTO mapped_table( disease_id,symptom_ids) VALUES (?,?)";
        values = [disease_id, symptom[i]];
        await connection.query(sql, values);
      }
      // Close the database connection
      await connection.end();
      // Send a 200 status with the success message
      res.status(200).send({message:"Insertion Successful"});
    } catch (err) {
      console.log(err.message)
      return res.status(500).send({message:err.message});
    }
  });
  
  mappedTableApp.post("/update-disease", async (req, res) => {
    try {
      // Retrieve the user object from the request body
      let userObj = req.body;
      // Extract the symptoms from the user object and store in a variable
      let a = userObj.symptom;
      // Declare a variable for storing duplicate disease id
      let duplicate;
      // Attempt to connect to the MySQL database
      let connection = await mysql.createConnection(db);
      // Create a SQL query for retrieving all the existing diseases and their symptoms from the database
      let sql = `SELECT disease_id,JSON_ARRAYAGG(symptom_ids) as symptom_ids FROM mapped_table group by disease_id;`;
      // Execute the SQL query and retrieve the result
      const [objects] = await connection.execute(sql);
      // Check if the disease with the same symptoms already exists in the database
      console.log(objects);
      
      const isEqual = objects.some((obj) => {
        // If the number of symptoms is not equal to the number of symptoms in the user object, return false
        if (obj.symptom_ids.length !== a.length) {
          return false;
        }
        // Loop through all the symptoms in the database
        for (let i = 0; i < obj.symptom_ids.length; i++) {
          // If the symptom in the database is not the same as the symptom in the user object, return false
          if (obj.symptom_ids[i] !== a[i]) {
            return false;
          }
        }
        // If the disease with the same symptoms is found, store its ID in the duplicate variable and return true
        duplicate = obj.disease_id;
        return true;
      });
      // If the disease with the same symptoms already exists in the database, return a 409 conflict status with the duplicate disease id
      if (isEqual) {
        return res
          .status(409)
          .send({ "with same symptoms diasease found": duplicate });
      }
  
      sql=`DELETE FROM mapped_table WHERE disease_id = ${userObj.disease_id}`
         await connection.query(sql);
  
      
     console.log("userObj",userObj)
      // Loop through all the symptoms in the user object and insert them into the database
      for (let i = 0; i < userObj.symptom.length; i++) {
        sql ="INSERT INTO mapped_table( disease_id,symptom_ids) VALUES (?,?)";
           values = [userObj.disease_id, userObj.symptom[i]];
           await connection.query(sql, values);
      }
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
  


  mappedTableApp.get("/remaining-disease", async (req, res) => {
    try {
      // Attempt to connect to the MySQL database
      let connection = await mysql.createConnection(db);
      // Create a SQL query for retrieving all the existing diseases and their symptoms from the database
      let sql = `SELECT disease_id,JSON_ARRAYAGG(symptom_ids) as symptom_ids FROM mapped_table group by disease_id;`;
      // Execute the SQL query and retrieve the result
      const [mappedData] = await connection.execute(sql);
      // Check if the disease with the same symptoms already exists in the database
     

      sql = `SELECT * FROM disease order by disease_id`;
      let [Diseases]=await connection.query(sql);
      // Close the database connection
      await connection.end();

      const filterData = Diseases.filter((disease) => !mappedData.some((item) => item.disease_id === disease.disease_id));

      
      // Send a 200 status with the success message
      res.status(200).send({message:"Success",payload:filterData});
    } catch (err) {
      // If there is an error, log the error and send a 500 internal server error status
      
      return res.status(500).send({message:err.message});
    }
  });
  


  module.exports=mappedTableApp
const exp = require("express");
const symptomApp = exp.Router();
symptomApp.use(exp.json());
const mysql = require("mysql2/promise");
const db = require('../config').db;



symptomApp.get("/get-symptoms", async (req, res) => {
  try {
    // Attempt to connect to the MySQL database
    let connection = await mysql.createConnection(db);
    // Create a SQL query for retrieving all symptoms from the database
    let sql = `SELECT * FROM symptoms order by symptom_id`;
    // Execute the SQL query and retrieve the result
    const [objects] = await connection.execute(sql);
    // Send a 200 status with the retrieved objects
    res.status(200).send(objects);
  } catch (err) {
    // If there is an error, log the error and send a 500 internal server error status
    console.error(err.message);
    return res.status(500).send(err.message);
  }
});


// Set up a POST route to create a new symptom master in the database
symptomApp.post("/create-symptom-master", async (req, res) => {
  try {
    // Retrieve the symptom object from the request body
    let dataObj = req.body;
    // Attempt to connect to the MySQL database
    let connection = await mysql.createConnection(db);
    // Create a SQL query to insert the new symptom into the database
    let sql = `INSERT INTO symptoms( symptom_id,symptom)  VALUES (?,?)`;
    values = [dataObj.symptom_id, dataObj.symptom];
    await connection.query(sql, values);
    // Close the database connection
    await connection.end();
    // Send a 200 status with the success message
    res.status(200).send({message:"Symptom created Successful"});
  } catch (err) {
    // If there is an error, log the error and send a 500 internal server error status
    console.error(err.message);
    return res.status(200).send({message:err.message});
  }
});


symptomApp.put("/update-symptom-master", async (req, res) => {
  try {
    // Retrieve the user object from the request body
    let dataObj = req.body;
    // Attempt to connect to the MySQL database
    let connection = await mysql.createConnection(db);
    // Create a SQL query for updating the symptom name in the database
    let sql = `UPDATE symptoms SET symptom = "${dataObj.symptomName}" WHERE symptom_id = ${dataObj.symptom_id}`;
    // Execute the SQL query
    await connection.query(sql);
    // Close the database connection
    await connection.end();
    // Send a 200 status with the success message
    res.status(200).send({message:"Symptom Name Updated Successful"});
  } catch (err) {
    // If there is an error, log the error and send a 500 internal server error status
   
    console.log(err.message)
    return res.status(200).send({message:err.message});
  }
});


symptomApp.delete("/delete-symptom-master/:id", async (req, res) => {
  try {
    let symptom_id = parseInt(req.params.id);
    // Retrieve the user object from the request body

    // Attempt to connect to the MySQL database
    let connection = await mysql.createConnection(db);

    // Select all rows from mapped_table and group them by disease_id
    let sql = `SELECT disease_id,JSON_ARRAYAGG(symptom_ids) as symptom_ids FROM mapped_table group by disease_id order by disease_id;`;
    const [objects] = await connection.execute(sql);
console.log(objects)
    
    // Convert the result to an array of symptom_ids arrays
    let objArr = [];
    for (let i = 0; i < objects.length; i++) {
      objArr.push(objects[i].symptom_ids);
    }

    // Define a function that separates arrays that include a certain element and those that don't
    const separateArrays = (arr, num) => {
      const present = arr.filter((subArr) => subArr.includes(num));
      const remaining = arr.filter((subArr) => !subArr.includes(num));
      return [present, remaining];
    };

    // Use the function to separate arrays that include the symptom to be deleted and those that don't
    const [presentArrays, remainingArrays] = separateArrays(
      objArr,
      symptom_id
    );

    // Define a function that removes a certain element from all arrays in an array of arrays
    const removeElements = (arr, elementToRemove) => {
      return arr.map((subArr) =>
        subArr.filter((element) => element !== elementToRemove)
      );
    };

    // Use the function to remove the symptom to be deleted from all arrays that include it
    const newArr = removeElements(presentArrays, symptom_id);


    // Define a function that checks if two arrays of arrays have at least one equal array
    const isEqual = (arr1, arr2) =>
      JSON.stringify(arr1) === JSON.stringify(arr2);

    const hasEqualArray = (a, b) =>
      a.some((arr1) => b.some((arr2) => isEqual(arr1, arr2)));

    // Check if any of the arrays that used to include the symptom to be deleted is now equal to an array in the remaining arrays
    if (hasEqualArray(newArr, remainingArrays))
      return res
        .status(409)
        .send({message:"Cannot delete this  because it create conflict in diseases symptom combination and make two disease have same symptoms "});

    // If there are no conflicts, delete all rows from mapped_table where disease_id is equal to the symptom to be deleted
    sql = `DELETE FROM symptoms WHERE symptom_id = ${symptom_id}`;

    await connection.query(sql);
    return res.send({message:"symptom deleted successfully"});
  } catch (err) {
    // If there is an error, log the error and send an error response to the client
    return res.status(500).send({message:err.message});
  }
});

// Export the Express router
module.exports = symptomApp;


/*
for (let i = 0; i < userObj.symptom.length; i++) {
      sql =
        `UPDATE mapped_table set symptom_ids = ${userObj.symptom[i]} WHERE disease_id = ${userObj.disease_id}`
      
      await connection.query(sql);
    }
    */
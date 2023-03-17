const exp = require("express");
const symptomApp = exp.Router();
symptomApp.use(exp.json());
const mysql = require("mysql2/promise");

// This is a POST endpoint that receives a request to insert a new disease with its symptoms
// The endpoint is defined with the async function
symptomApp.post("/insert-disease", async (req, res) => {
  try {
    // Retrieve the user object from the request body
    let userObj = req.body;
    // Extract the symptoms from the user object and store in a variable
    let a = userObj.symptom;
    // Declare a variable for storing duplicate disease id
    let duplicate;
    // Attempt to connect to the MySQL database
    let connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "madhu",
      database: "myfirstdb",
    });
    // Create a SQL query for retrieving all the existing diseases and their symptoms from the database
    let sql = `SELECT disease_id,JSON_ARRAYAGG(symptom_ids) as symptom_ids FROM projectdb.mapped_table group by disease_id;`;
    // Execute the SQL query and retrieve the result
    const [objects] = await connection.execute(sql);
    // Check if the disease with the same symptoms already exists in the database
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
    // Loop through all the symptoms in the user object and insert them into the database
    for (let i = 0; i < userObj.symptom.length; i++) {
      sql =
        "INSERT INTO projectdb.mapped_table( disease_id,symptom_ids) VALUES (?,?)";
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

symptomApp.delete("/delete-symptom", async (req, res) => {
  try {
    console.log(req.body.id);
    // Retrieve the user object from the request body

    // Attempt to connect to the MySQL database
    let connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "madhu",
      database: "myfirstdb",
    });

    // Select all rows from mapped_table and group them by disease_id
    let sql = `SELECT disease_id,JSON_ARRAYAGG(symptom_ids) as symptom_ids FROM projectdb.mapped_table group by disease_id;`;
    const [objects] = await connection.execute(sql);

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
      req.body.id
    );
    console.log("Present:", presentArrays);
    console.log("Remaining:", remainingArrays);

    // Define a function that removes a certain element from all arrays in an array of arrays
    const removeElements = (arr, elementToRemove) => {
      return arr.map((subArr) =>
        subArr.filter((element) => element !== elementToRemove)
      );
    };

    // Use the function to remove the symptom to be deleted from all arrays that include it
    const newArr = removeElements(presentArrays, req.body.id);
    console.log("element removed array", newArr);

    // Define a function that checks if two arrays of arrays have at least one equal array
    const isEqual = (arr1, arr2) =>
      JSON.stringify(arr1) === JSON.stringify(arr2);

    const hasEqualArray = (a, b) =>
      a.some((arr1) => b.some((arr2) => isEqual(arr1, arr2)));

    // Check if any of the arrays that used to include the symptom to be deleted is now equal to an array in the remaining arrays
    if (hasEqualArray(newArr, remainingArrays))
      return res
        .status(403)
        .send("Cannot delete symptom cuz two diseases will conflict");

    // If there are no conflicts, delete all rows from mapped_table where disease_id is equal to the symptom to be deleted
    sql = `DELETE FROM projectdb.mapped_table WHERE symptom_ids = ${req.body.id}`;

    let result = await connection.query(sql);
    return res.send("symptom deleted successfully");
  } catch (err) {
    // If there is an error, log the error and send an error response to the client
    return res.status(500).send(err.message);
  }
});

// Export the Express router
module.exports = symptomApp;

const exp = require("express");
const asyncApp = exp.Router();
asyncApp.use(exp.json());
const mysql = require("mysql2/promise");

// Define a route to retrieve all users from the 'users' table in the database
asyncApp.get("/get-users", async (req, res) => {
  try {
    // Attempt to connect to the MySQL database
    const connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "madhu",
      database: "myfirstdb",
    });
    // Define an SQL query to retrieve all users from the 'users' table
    let sql = `SELECT disease_id,JSON_ARRAYAGG(symptom_ids) FROM projectdb.mapped_table group by disease_id;`;
    // Execute the query and retrieve the result
    let result = await connection.query(sql);
    // Send the result to the client as a response
    res.status(200).send(result[0]);
  } catch (err) {
    // If there is an error, send an error response to the client
    return res.status(500).send(err.message);
  }
});

// Define a route to create a new user in the 'users' table
asyncApp.post("/insert-disease", async (req, res) => {
  try {
    // Retrieve the user object from the request body
    let userObj = req.body;
    let a = userObj.symptom;
    let duplicate;
    // Attempt to connect to the MySQL database
    let connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "madhu",
      database: "myfirstdb",
    });

    let sql = `SELECT disease_id,JSON_ARRAYAGG(symptom_ids) as symptom_ids FROM projectdb.mapped_table group by disease_id;`;
    const [objects] = await connection.execute(sql);
    // Execute the query and retrieve the result
    const isEqual = objects.some((obj) => {
      if (obj.symptom_ids.length !== a.length) {
        return false;
      }
      for (let i = 0; i < obj.symptom_ids.length; i++) {
        if (obj.symptom_ids[i] !== a[i]) {
          return false;
        }
      }
      duplicate = obj.disease_id;
      return true;
    });
    if (isEqual) {
      return res
        .status(409)
        .send({ "with same symptoms diasease found": duplicate });
    }

    for (let i = 0; i < userObj.symptom.length; i++) {
      sql =
        "INSERT INTO projectdb.mapped_table( disease_id,symptom_ids)  VALUES (?,?)";
      values = [userObj.disease_id, userObj.symptom[i]];
      await connection.query(sql, values);
    }

    // Close the database connection
    await connection.end();

    res.status(200).send("Insertion Successful");
  } catch (err) {
    // If there is an error, log the error and send an error response to the client
    console.error(err.message);
    return res.status(500).send("Internal Server Error");
  }
});


asyncApp.delete("/delete-symptom", async (req, res) => {
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

    let sql = `SELECT disease_id,JSON_ARRAYAGG(symptom_ids) as symptom_ids FROM projectdb.mapped_table group by disease_id;`;
    const [objects] = await connection.execute(sql);

    let objArr = [];

    for (let i = 0; i < objects.length; i++) {
      objArr.push(objects[i].symptom_ids);
    }

    const separateArrays = (arr, num) => {
      const present = arr.filter((subArr) => subArr.includes(num));
      const remaining = arr.filter((subArr) => !subArr.includes(num));
      return [present, remaining];
    };

    const [presentArrays, remainingArrays] = separateArrays(
      objArr,
      req.body.id
    );
    console.log("Present:", presentArrays);
    console.log("Remaining:", remainingArrays);

    const removeElements = (arr, elementToRemove) => {
      return arr.map((subArr) =>
        subArr.filter((element) => element !== elementToRemove)
      );
    };

    const newArr = removeElements(presentArrays, req.body.id);
    console.log(newArr);

    const isEqual = (arr1, arr2) =>
      JSON.stringify(arr1) === JSON.stringify(arr2);

    const hasEqualArray = (a, b) =>
      a.some((arr1) => b.some((arr2) => isEqual(arr1, arr2)));

    if (hasEqualArray(newArr, remainingArrays))
     return res
        .status(403)
        .send("Cannot delete symptom cuz two diseases will conflict");
      
    sql = `DELETE FROM projectdb.mapped_table WHERE disease_id = ${req.body.id}`;
    let result = await connection.query(sql);
    return res.send(result);
  } catch (err) {
    // If there is an error, log the error and send an error response to the client
    return res.status(500).send(err.message);
  }
});

// Export the Express router
module.exports = asyncApp;

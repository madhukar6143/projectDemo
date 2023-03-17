const exp = require("express");
const app = exp();
const symptomApp = require("./APIS/symptomApi");

app.use("/symptomApp",symptomApp)
//homepage
app.get("/", function (req, res) {
  res.send("Home Page");
});

const port = 5000;
app.listen(port, () => console.log(`Server can hear you on ${port}....`));
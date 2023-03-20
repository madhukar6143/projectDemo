const exp = require("express");
const app = exp();
const symptomApp = require("./APIS/symptomApi");
const diseaseApp = require("./APIS/diseaseApi")
const mappedTableApp=require("./APIS/mappedTableApi")
const searchApp = require('./APIS/searchDisease')
const cors = require('cors');
const userApp = require("./UserAPIS/users");
const corsOptions ={
    origin:["http://localhost:3000","http://localhost:3001"], 
    credentials:true,            //access-control-allow-credentials:true
    optionSuccessStatus:200
}
app.use(cors(corsOptions));

app.use("/symptomApp",symptomApp)
app.use("/diseaseApp",diseaseApp)
app.use("/mappedtable",mappedTableApp)
app.use("/search",searchApp)
app.use("/user",userApp)
//homepage
app.get("/", function (req, res) {
  res.send("Home Page");
});

const port = 5000;
app.listen(port, () => console.log(`Server can hear you on ${port}....`));
require("dotenv").config();
const express = require("express");
const path = require("path");
const fetch = require("node-fetch");

const app = express();

app.set("view engine", "ejs");
// if public folder includes index html file, it'll be served automatically at '/'
app.use(express.static("public"));
// instead of body parser which is deprecated
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

function addDays(deltaDays, dateMin) {
  /**
   * delta Days: number of days. Integer
   * dateMin: starting date in the form 'yyyy-mm-dd'. If omitted, current date is used.
   * function adds deltaDays to the dateMin
   * returns a string in the form 'yyyy-mm-dd'
   */
  let dateMax = dateMin ? new Date(dateMin) : new Date();
  dateMax.setDate(dateMax.getDate() + deltaDays);
  return dateMax.toISOString().split("T")[0];
}

async function getCloseApproachData(dateMin, dateMax) {
  const apiResponse = await fetch(
    `https://ssd-api.jpl.nasa.gov/cad.api?date-min=${dateMin}&date-max=${dateMax}&body=Earth&fullname=true&dist-max=0.05`
  );

  if (!apiResponse.ok) {
    const { status, statusText } = apiResponse;
    const error = new Error(statusText);
    error.status = status;
    throw error;
  }
  const data = await apiResponse.json();
  return data;
}

async function getObjectData(name) {
  const apiResponse = await fetch(
    `https://ssd-api.jpl.nasa.gov/sbdb.api?des=${name}&discovery=true`
  );
  const data = await apiResponse.json();
  return data;
}

async function getNeowsData(spkid) {
  const apiResponse = await fetch(
    `https://api.nasa.gov/neo/rest/v1/neo/${spkid}?api_key=${process.env.NASA_API}`
  );
  if (!apiResponse.ok) return { status: apiResponse.status };
  const data = await apiResponse.json();
  return data;
}

app.get("/", (request, response) => {
  response.render("landing.ejs");
});

app.get("/table/", async (request, response) => {
  response.render("index.ejs");
});

app.post("/getcadata/", async (request, response, next) => {
  try {
    const dateMin = request.query.date ? request.query.date : addDays(0);
    const dateMax = addDays(60, dateMin);
    const data = await getCloseApproachData(dateMin, dateMax);
    return response.render("cadata.ejs", { data: data, date: dateMin });
  } catch (err) {
    next(err);
  }
});

app.post("/getobjectdata", async (request, response) => {
  let name = request.body.name.replace(/-/, "%20");
  const objectData = await getObjectData(name);
  const spkid = await objectData.object.spkid;
  const neowsData = await getNeowsData(spkid);
  return response.render("objectdata.ejs", {
    objectData: objectData,
    neowsData: neowsData,
  });
});

app.use((err, req, res, next) => {
  const { status = 500, message = "Server error", stack } = err;
  console.log(stack);
  res.status(status).json({ message });
});

app.listen(process.env.PORT || 8000, () => console.log("running..."));

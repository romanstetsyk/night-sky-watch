"use strict";

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

/**
 * add 'delta' days to the date
 * @param {number} delta number of days to add
 * @param {string|Date} start starting date
 * @returns {string} date in a 'yyyy-mm-dd' format
 */
function addDays(delta, start = new Date()) {
  const end = new Date(start);
  end.setDate(end.getDate() + delta);
  return end.toISOString().split("T")[0];
}

async function getCloseApproachData(dateMin, dateMax) {
  const res = await fetch(
    `https://ssd-api.jpl.nasa.gov/cad.api?date-min=${dateMin}&date-max=${dateMax}&body=Earth&fullname=true&dist-max=0.05`
  );

  if (!res.ok) {
    const { status, statusText } = res;
    const error = new Error(statusText);
    error.status = status;
    throw error;
  }
  const data = await res.json();
  return data;
}

async function getObjectData(name) {
  const res = await fetch(
    `https://ssd-api.jpl.nasa.gov/sbdb.api?des=${name}&discovery=true`
  );
  if (!res.ok) {
    const { status, statusText } = res;
    const error = new Error(statusText);
    error.status = status;
    throw error;
  }
  const data = await res.json();
  return data;
}

async function getNeowsData(spkid) {
  const { NASA_API } = process.env;
  const res = await fetch(
    `https://api.nasa.gov/neo/rest/v1/neo/${spkid}?api_key=${NASA_API}`
  );
  if (!res.ok) {
    const { status, statusText } = res;
    const error = new Error(statusText);
    error.status = status;
    throw error;
  }
  const data = await res.json();
  return data;
}

app.get("/", (_, res) => {
  res.render("landing.ejs");
});

app.get("/table/", async (_, res) => {
  res.render("index.ejs");
});

app.post("/getcadata/", async (req, res, next) => {
  const { date } = req.query;
  const dateMin = date || addDays(0);
  const dateMax = addDays(60, dateMin);

  let data;
  try {
    data = await getCloseApproachData(dateMin, dateMax);
  } catch (err) {
    return next(err);
  }
  return res.render("cadata.ejs", { data });
});

app.post("/getobjectdata", async (req, res, next) => {
  let { name } = req.body;
  name = name.replace(/-/, "%20");

  let objectData;
  try {
    objectData = await getObjectData(name);
  } catch (err) {
    // Return is necessary to stop further statements from executing
    return next(err);
  }

  const { spkid } = await objectData.object;

  let neowsData;
  try {
    neowsData = await getNeowsData(spkid);
  } catch (err) {
    neowsData = { status: 404 };
  }

  return res.render("objectdata.ejs", { objectData, neowsData });
});

app.use((err, req, res, next) => {
  const { status = 500, message = "Server error", stack } = err;
  console.log(stack);
  res.status(status).json({ message });
});

const { PORT = 8000 } = process.env;
app.listen(PORT, () => console.log(`running on ${PORT} ...`));

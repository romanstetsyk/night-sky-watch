const express = require('express');
const path = require('path');


const app = express();


app.set('view engine', 'ejs')
// if public folder includes index html file, it'll be served automatically at '/'
app.use(express.static('public'))
// instead of body parser which is deprecated
app.use(express.urlencoded({ extended: true }))
app.use(express.json())


function addDays(deltaDays, dateMin) {
    /**
     * delta Days: number of days. Integer
     * dateMin: starting date in the form 'yyyy-mm-dd'. If omitted, current date is used.
     * function adds deltaDays to the dateMin
     * returns a string in the form 'yyyy-mm-dd'
     */
    let dateMax = dateMin ? new Date(dateMin) : new Date();
    dateMax.setDate(dateMax.getDate() + deltaDays);
    return dateMax.toISOString().split('T')[0];
}

async function getCloseApproachData(dateMin, dateMax) {
    const apiResponse = await fetch(`https://ssd-api.jpl.nasa.gov/cad.api?date-min=${dateMin}&date-max=${dateMax}&body=Earth&fullname=true&dist-max=0.1`);
    const data = await apiResponse.json();
    return data;
}

async function getObjectData(name) {
    const apiResponse = await fetch(`https://ssd-api.jpl.nasa.gov/sbdb.api?des=${name}`);
    const data = await apiResponse.json();
    return data;
}

// async function getNeowsData(spkid) {
//     const apiResponse = await fetch(``)
// }

// global object to be available across all routes.
// should use cache to avoid this
let globalData;

app.get('/', async (request, response) => {

    let dateMin = request.query.date ? request.query.date : addDays(0);
    let dateMax = addDays(60, dateMin);
    
    let data = await getCloseApproachData(dateMin, dateMax);

    globalData = data;

    // console.log(data);
    response.render('index.ejs', {data: data, date: dateMin});
});

app.post('/dateSearch', (request, response) => {
    let date = request.body.date
    // To redirect in browser the request should be made using html <form>
    return response.redirect('/?date=' + date);
})

app.post('/animation', async (request, response) => {
    let name = request.body.name.replace(/-/, ' ');
    console.log(name);
    let row = globalData.data.find(row => row[11].includes(name));
    console.log(row);
    return response.json({'url': `https://cneos.jpl.nasa.gov/ca/ov/#load=&desig=${row[0]}&cajd=${row[2]}&`});
})

app.post('/getobjectdata', async (request, response) => {
    let name = request.body.name.replace(/-/, '%20');
    console.log(name);
    const objectData = await getObjectData(name);
    console.log(objectData);
    return response.render('objectdata.ejs', {data: objectData});
    // return response.json(objectData);
})


app.listen(8000, () => console.log('running...'));

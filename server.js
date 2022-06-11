const express = require('express');
const path = require('path');
const apicache = require("apicache");
const { response } = require('express');


const app = express();


//configure apicache 
let cache = apicache.middleware
//caching all routes for 5 minutes
app.use(cache('5 minutes'))


app.set('etag', false);


app.set('view engine', 'ejs')
// if public folder includes index html file, it'll be served automatically at '/'
app.use(express.static('public'))
// instead of body parser which is deprecated
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.get('/', async (request, response) => {

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

    let dateMin = request.query.date ? request.query.date : addDays(0);
    let dateMax = addDays(60, dateMin);
    
    console.log(`https://ssd-api.jpl.nasa.gov/cad.api?date-min=${dateMin}&date-max=${dateMax}&body=Earth&fullname=true&dist-max=1`);
    const apiRes = await fetch(`https://ssd-api.jpl.nasa.gov/cad.api?date-min=${dateMin}&date-max=${dateMax}&body=Earth&fullname=true&dist-max=1`);
    const data = await apiRes.json();

    // console.log(data);
    response.render('index.ejs', {data: data, date: dateMin});
});

app.post('/dateSearch', (request, response) => {
    let date = request.body.date
    // To redirect in browser the request should be made using html <form>
    return response.redirect('/?date=' + date);
})


app.listen(8000, () => console.log('running...'));

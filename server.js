const bodyParser = require("body-parser");

const express = require('express');

const scrapeRoute = require("./routes/scrape");

const app = express();

app.use(bodyParser.urlencoded({extended: false}));

app.use(scrapeRoute);

app.use((req, res, next) => {
    res.status(404).send({
        'status': '404',
        'message': 'not found',
    });
});

app.listen(process.env.PORT || 4000, () => {
    console.log('server running');
});
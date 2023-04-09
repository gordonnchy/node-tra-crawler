const path = require('path');

const bodyParser = require('body-parser');

const express = require('express');

const crawlerRoute = require('./routes/crawler');

const scrapeRoute = require('./routes/scrape');

const app = express();

app.use(express.static(path.join(path.dirname(require.main.filename), 'public')));

app.set('view engine', 'ejs');

app.set('views', 'views');

app.use(bodyParser.urlencoded({extended: false}));

app.use(crawlerRoute);

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
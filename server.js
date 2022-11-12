const express = require('express')

const scraper = require('./utils/scraper')
const app = express()

app.get('/', (req, res) => {
    res.send('Hello, World');
})

app.get('/receipt/:code/:time', (req, res) => {
    const traReceipt = new Promise((resolve, reject) => {
        scraper
            .scrapeTra(req.params.code, req.params.time)
            .then(data => {
                resolve(data);
            })
            .catch(err => reject('Tra scrape failed'))
    })

    Promise.all([traReceipt])
        .then(data => {
            res.send(data[0][0])
        })
        .catch(err => res.status(500).send(err))
})

app.listen(3000, '172.20.10.8')
const express = require("express");

const {scrapeTra} = require("../utils/scraper");

const router = express.Router();

router.get('/ping', (req, res, next) => {
    res.status(200).send({
        'message': 'pong'
    });
});

router.get('/receipt/:code/:time', (req, res) => {
    try {
        scrapeTra(req.params.code, req.params.time).then(value => {
            res.send(value);
        });
    } catch (error) {
        console.log("Error duing scraping: ", error);
        res.status(500).send({
            'code': 500,
            'message': 'Operation failed',
        });
    }
});

module.exports = router;
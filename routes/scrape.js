const express = require('express');

const Request = require('../models/request');

const { scrapeTra } = require('../utils/scraper');

const router = express.Router();

router.get('/ping', (req, res, next) => {
    res.status(200).send({
        'message': 'pong'
    });
});

router.get('/receipt/:code/:time', (req, res) => {
    const start = (new Date()).getTime();
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    try {
        scrapeTra(req.params.code, req.params.time).then(value => {
            const end = (new Date()).getTime();
            const diff = end - start;
            const request = new Request(null, ip, diff, 'success');
            request.save(() => {
                res.send(value);
            });
        });
    } catch (error) {
        const end = (new Date()).getTime();
        const diff = end - start;
        const request = new Request(null, ip, diff, 'success');
        request.save(() => {
            console.log('Error duing scraping: ', error);
            res.status(500).send({
                'code': 500,
                'message': 'Operation failed',
            });
        });
    }
});

module.exports = router;
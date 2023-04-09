const express = require('express');

const crawlerController = require('../controllers/crawler');

const router = express.Router();

router.get('/', crawlerController.getIndex);

module.exports = router;
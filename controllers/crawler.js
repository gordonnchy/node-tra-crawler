const Request = require('../models/request');

exports.getIndex = (req, res, next) => {
    Request.all(requests => {
        res.render('analyze', {reqs: requests});
    });
}
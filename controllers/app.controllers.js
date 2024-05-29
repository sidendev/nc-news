const { selectTopics, selectApiDetails } = require('../models/app.models');

exports.getTopics = (req, res, next) => {
  selectTopics()
    .then((topics) => {
      res.status(200).send({ topics });
    })
    .catch(next);
};

exports.getApiDetails = (req, res, next) => {
  selectApiDetails()
    .then((details) => {
      res.status(200).send({ details });
    })
    .catch(next);
};

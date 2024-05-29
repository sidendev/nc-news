const express = require('express');
const app = express();
app.use(express.json());
const {
  getTopics,
  getApiDetails,
  getArticleById,
} = require('./controllers/app.controllers');

app.get('/api/topics', getTopics);

app.get('/api', getApiDetails);

app.get('/api/articles/:article_id', getArticleById);

app.use((err, req, res, next) => {
  if (err.code) {
    res.status(400).send({ msg: 'Bad request' });
  } else {
    next(err);
  }
});

app.use((err, req, res, next) => {
  if (err.status && err.msg) {
    res.status(err.status).send({ msg: err.msg });
  } else {
    res.status(500).send({ msg: 'Internal Server Error' });
  }
});

module.exports = app;

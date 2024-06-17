const cors = require('cors');
const express = require('express');
const app = express();
app.use(cors());
const {
  getTopics,
  getApiDetails,
  getArticleById,
  getArticles,
  getCommentsByArticleId,
  postCommentByArticleId,
  patchArticleVotesById,
  deleteCommentById,
  getUsers,
} = require('./controllers/app.controllers');
app.use(express.json());

app.get('/api/topics', getTopics);

app.get('/api', getApiDetails);

app.get('/api/articles/:article_id', getArticleById);
app.patch('/api/articles/:article_id', patchArticleVotesById);

app.get('/api/articles', getArticles);

app.get('/api/articles/:article_id/comments', getCommentsByArticleId);
app.post('/api/articles/:article_id/comments', postCommentByArticleId);

app.delete('/api/comments/:comment_id', deleteCommentById);

app.get('/api/users', getUsers);

app.use((err, req, res, next) => {
  if (err.code === '23503') {
    res.status(404).send({ msg: 'Not found' });
  } else if (err.code === '22P02') {
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

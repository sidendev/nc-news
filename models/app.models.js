const db = require('../db/connection');
const fs = require('fs/promises');

exports.selectTopics = () => {
  return db
    .query(
      `SELECT
        topics.slug,
        topics.description
        FROM topics;`
    )
    .then(({ rows }) => {
      return rows;
    });
};

exports.selectApiDetails = () => {
  return fs.readFile('endpoints.json', 'utf-8').then((details) => {
    return JSON.parse(details);
  });
};

exports.selectArticleById = (article_id) => {
  return db
    .query('SELECT * FROM articles WHERE article_id = $1;', [article_id])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: 'Article does not exist' });
      }
      return rows[0];
    });
};

exports.selectArticles = () => {
  return db
    .query(
      `SELECT
        articles.article_id,
        articles.title,
        articles.topic,
        articles.author,
        articles.created_at,
        articles.votes,
        articles.article_img_url,
      COUNT(comments.comment_id)::INT AS comment_count 
      FROM articles 
      LEFT JOIN comments ON articles.article_id = comments.article_id 
      GROUP BY articles.article_id 
      ORDER BY articles.created_at DESC;`
    )
    .then(({ rows }) => {
      return rows;
    });
};

exports.selectCommentsByArticleId = (article_id) => {
  return db
    .query(
      'SELECT * FROM comments WHERE comments.article_id = $1 ORDER BY comments.created_at DESC;',
      [article_id]
    )
    .then(({ rows }) => {
      return rows;
    });
};

exports.checkArticleExists = (article_id) => {
  return db
    .query(`SELECT * FROM articles WHERE article_id = $1`, [article_id])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: 'No article found' });
      }
    });
};

exports.insertCommentByArticleId = (article_id, author, body) => {
  if (typeof author !== 'string' || typeof body !== 'string')
    return Promise.reject({
      status: 400,
      msg: 'Bad request - invalid input for comment',
    });
  if (author.length === 0 || body.length === 0)
    return Promise.reject({
      status: 400,
      msg: 'Bad request - missing input for comment',
    });
  return db
    .query(
      'INSERT INTO comments (article_id, author, body) VALUES ($1, $2, $3) RETURNING *;',
      [article_id, author, body]
    )
    .then((result) => {
      return result.rows[0];
    });
};

exports.updateArticleVotesById = (article_id, inc_votes) => {
  if (typeof inc_votes !== 'number')
    return Promise.reject({
      status: 400,
      msg: 'Bad request, invalid input for updating votes',
    });
  return db
    .query(
      'UPDATE articles SET votes = votes + $1 WHERE article_id = $2 RETURNING *;',
      [inc_votes, article_id]
    )
    .then((result) => {
      return result.rows[0];
    });
};

exports.removeCommentById = (comment_id) => {
  return db
    .query(`DELETE FROM comments WHERE comment_id = $1 RETURNING *;`, [
      comment_id,
    ])
    .then((result) => {
      if (result.rows.length === 0) {
        return Promise.reject({
          status: 404,
          msg: 'Comment not found',
        });
      }
      return result;
    });
};

exports.selectUsers = () => {
  return db.query(`SELECT * FROM users;`).then(({ rows }) => {
    return rows;
  });
};

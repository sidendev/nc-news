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

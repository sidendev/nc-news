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
  return fs.readFile(`endpoints.json`, 'utf-8').then((details) => {
    return JSON.parse(details);
  });
};

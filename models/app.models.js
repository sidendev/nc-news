const db = require('../db/connection');

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

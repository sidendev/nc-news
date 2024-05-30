const app = require('../app');
const request = require('supertest');
const db = require('../db/connection');
const seed = require('../db/seeds/seed');
const data = require('../db/data/test-data');
const fs = require('fs');

beforeEach(() => seed(data));
afterAll(() => db.end());

describe('/api/topics', () => {
  test('GET:200 and sends array of all topics with properties of slug and description', () => {
    return request(app)
      .get('/api/topics')
      .expect(200)
      .then(({ body }) => {
        expect(body.topics).toHaveLength(3);
        body.topics.forEach((topic) => {
          expect(typeof topic.description).toBe('string');
          expect(typeof topic.slug).toBe('string');
        });
      });
  });
});

describe('GET/api', () => {
  test('GET:200 responds with an object of endpoint details and checks if description is present and is a string: ', () => {
    return request(app)
      .get('/api')
      .expect(200)
      .then(({ body }) => {
        const endpointDetails = body.details;
        for (let endpoint in endpointDetails) {
          expect(typeof endpointDetails[endpoint].description).toBe('string');
        }
      });
  });
  test('GET:200 compares original json file to be equal to the data sent back from api', () => {
    const originalEndpointDetails = fs.readFileSync(
      './endpoints.json',
      'utf-8'
    );
    return request(app)
      .get('/api')
      .expect(200)
      .then((res) => {
        expect(res.body.details).toEqual(JSON.parse(originalEndpointDetails));
      });
  });
});

describe('/api/articles/:article_id', () => {
  test('GET:200 sends an article to client with expected data by id', () => {
    return request(app)
      .get('/api/articles/1')
      .expect(200)
      .then((res) => {
        expect(res.body.article.article_id).toBe(1);
        expect(res.body.article.title).toBe(
          'Living in the shadow of a great man'
        );
        expect(res.body.article.topic).toBe('mitch');
        expect(res.body.article.author).toBe('butter_bridge');
        expect(res.body.article.body).toBe('I find this existence challenging');
        expect(res.body.article.votes).toBe(100);
      });
  });
  test('GET:404 sends an appropriate status and error message when given a valid but non-existent id', () => {
    return request(app)
      .get('/api/articles/99999')
      .expect(404)
      .then((res) => {
        expect(res.body.msg).toBe('Article does not exist');
      });
  });
  test('GET:400 sends an appropriate status and error message when given an invalid id', () => {
    return request(app)
      .get('/api/articles/not-an-id')
      .expect(400)
      .then((res) => {
        expect(res.body.msg).toBe('Bad request');
      });
  });
});

describe('/api/articles', () => {
  test('GET:200 and sends array of all articles with comment_count added and body removed', () => {
    return request(app)
      .get('/api/articles')
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toHaveLength(13);
        body.articles.forEach((article) => {
          expect(typeof article.title).toBe('string');
          expect(typeof article.topic).toBe('string');
          expect(typeof article.author).toBe('string');
          expect(typeof article.created_at).toBe('string');
          expect(typeof article.article_img_url).toBe('string');
          expect(typeof article.comment_count).toBe('number');
        });
      });
  });
  test('GET:200 checks returned array is in descending order by created_at', () => {
    return request(app)
      .get('/api/articles')
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toHaveLength(13);
        expect(body.articles).toBeSorted('created_at');
      });
  });
});

describe('/api/articles/:article_id/comments', () => {
  test('GET:200 sends an array of comments for the given article_id to the client', () => {
    return request(app)
      .get('/api/articles/9/comments')
      .expect(200)
      .then((response) => {
        expect(response.body.comments.length).toBe(2);
        response.body.comments.forEach((comment) => {
          expect(typeof comment.comment_id).toBe('number');
          expect(typeof comment.body).toBe('string');
          expect(typeof comment.votes).toBe('number');
          expect(typeof comment.author).toBe('string');
          expect(typeof comment.article_id).toBe('number');
          expect(typeof comment.created_at).toBe('string');
        });
      });
  });
  test('GET:200 checks returned comments is sorted by created_at, most recent first', () => {
    return request(app)
      .get('/api/articles/1/comments')
      .expect(200)
      .then(({ body }) => {
        expect(body.comments).toHaveLength(11);
        expect(body.comments).toBeSorted('created_at');
      });
  });
  test('GET:404 sends an appropriate status and error message when given a valid but non-existent article id', () => {
    return request(app)
      .get('/api/articles/99999/comments')
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe('No comments found');
      });
  });
  test('GET:400 responds with an appropriate error message when given an invalid article id', () => {
    return request(app)
      .get('/api/articles/not-an-id/comments')
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe('Bad request');
      });
  });
});

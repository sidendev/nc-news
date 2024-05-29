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

const app = require('../app');
const request = require('supertest');
const db = require('../db/connection');
const seed = require('../db/seeds/seed');
const data = require('../db/data/test-data');

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
});

const app = require('../app');
const request = require('supertest');
const db = require('../db/connection');
const seed = require('../db/seeds/seed');
const data = require('../db/data/test-data');
const fs = require('fs');

beforeEach(() => seed(data));
afterAll(() => db.end());

describe('GET/api/topics', () => {
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
      .then(({ body }) => {
        expect(body.details).toEqual(JSON.parse(originalEndpointDetails));
      });
  });
});

describe('GET/api/articles/:article_id', () => {
  test('GET:200 sends an article to client with expected data by id', () => {
    return request(app)
      .get('/api/articles/1')
      .expect(200)
      .then(({ body }) => {
        expect(body.article.article_id).toBe(1);
        expect(body.article.title).toBe('Living in the shadow of a great man');
        expect(body.article.topic).toBe('mitch');
        expect(body.article.author).toBe('butter_bridge');
        expect(body.article.body).toBe('I find this existence challenging');
        expect(body.article.votes).toBe(100);
      });
  });
  test('GET:404 sends an appropriate status and error message when given a valid but non-existent id', () => {
    return request(app)
      .get('/api/articles/99999')
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe('Article does not exist');
      });
  });
  test('GET:400 sends an appropriate status and error message when given an invalid id', () => {
    return request(app)
      .get('/api/articles/not-an-id')
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe('Bad request');
      });
  });
  test('GET:200 sends article to client with data by id given and adds comment_count for total comments for article', () => {
    return request(app)
      .get('/api/articles/9')
      .expect(200)
      .then(({ body }) => {
        expect(body.article.comment_count).toBe(2);
      });
  });
  test('GET:200 sends article to client with data by id, returns 0 for comment_count if there are no comments for article', () => {
    return request(app)
      .get('/api/articles/2')
      .expect(200)
      .then(({ body }) => {
        expect(body.article.comment_count).toBe(0);
      });
  });
});

describe('GET/api/articles', () => {
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
        expect(body.articles).toBeSorted('created_at', { descending: true });
      });
  });
});

describe('GET/api/articles/:article_id/comments', () => {
  test('GET:200 sends an array of comments for the given article_id to the client', () => {
    return request(app)
      .get('/api/articles/9/comments')
      .expect(200)
      .then(({ body }) => {
        expect(body.comments.length).toBe(2);
        body.comments.forEach((comment) => {
          expect(typeof comment.comment_id).toBe('number');
          expect(typeof comment.body).toBe('string');
          expect(typeof comment.votes).toBe('number');
          expect(typeof comment.author).toBe('string');
          expect(comment.article_id).toBe(9);
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
        expect(body.comments).toBeSorted('created_at', { descending: true });
      });
  });
  test('GET:200 sends an empty array back when passed article_id that is valid but has no current comments', () => {
    return request(app)
      .get('/api/articles/2/comments')
      .expect(200)
      .then(({ body }) => {
        expect(body.comments).toEqual([]);
      });
  });
  test('GET:404 sends an appropriate status and error message when given a valid but non-existent article id', () => {
    return request(app)
      .get('/api/articles/99999/comments')
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe('No article found');
      });
  });
  test('GET:400 responds with an appropriate error message when given an invalid article id', () => {
    return request(app)
      .get('/api/articles/not-an-id/comments')
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe('Bad request');
      });
  });
});

describe('POST/api/articles/:article_id/comments', () => {
  test('POST:201 adds a new comment to an article and sends the comment back to the client', () => {
    const newComment = {
      author: 'lurker',
      body: 'This is my first comment!',
    };
    return request(app)
      .post('/api/articles/9/comments')
      .send(newComment)
      .expect(201)
      .then(({ body }) => {
        expect(typeof body.comment.comment_id).toBe('number');
        expect(body.comment.body).toBe('This is my first comment!');
        expect(body.comment.article_id).toBe(9);
        expect(body.comment.author).toBe('lurker');
        expect(typeof body.comment.votes).toBe('number');
        expect(typeof body.comment.created_at).toBe('string');
      });
  });
  test('POST:400 responds with an appropriate status and error message when provided with a bad request (invalid article id)', () => {
    const newComment = {
      author: 'lurker',
      body: 'This is my first comment!',
    };
    return request(app)
      .post('/api/articles/not-an-id/comments')
      .send(newComment)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe('Bad request');
      });
  });
  test('POST:404 responds with status and error message when input a bad request (valid type article id but not present in db)', () => {
    const newComment = {
      author: 'lurker',
      body: 'This is my first comment!',
    };
    return request(app)
      .post('/api/articles/99999/comments')
      .send(newComment)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe('Not found');
      });
  });
  test('POST:400 responds with 400 status and error message when given a bad request (invalid datatype for comment)', () => {
    const newComment = {
      author: 'lurker',
      body: 456454545511188,
    };
    return request(app)
      .post('/api/articles/9/comments')
      .send(newComment)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe('Bad request - invalid input for comment');
      });
  });
  test('POST:400 responds with 400 status and error message when given a bad request (missing data for comment)', () => {
    const newComment = {
      author: 'lurker',
      body: '',
    };
    return request(app)
      .post('/api/articles/9/comments')
      .send(newComment)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe('Bad request - missing input for comment');
      });
  });
});

describe('PATCH/api/articles/:article_id', () => {
  test('PATCH:200 update an article by id entered, returns updated article with vote changed by input given', () => {
    const newVote = {
      inc_votes: 5,
    };
    return request(app)
      .patch('/api/articles/1')
      .send(newVote)
      .expect(200)
      .then(({ body }) => {
        expect(body.article.article_id).toBe(1);
        expect(body.article.title).toBe('Living in the shadow of a great man');
        expect(body.article.topic).toBe('mitch');
        expect(body.article.author).toBe('butter_bridge');
        expect(body.article.body).toBe('I find this existence challenging');
        expect(typeof body.article.created_at).toBe('string');
        expect(body.article.votes).toBe(105);
        expect(typeof body.article.article_img_url).toBe('string');
      });
  });
  test('PATCH:200 update an article without any current votes by id entered, returns updated article with vote added by input given', () => {
    const newVote = {
      inc_votes: 10,
    };
    return request(app)
      .patch('/api/articles/3')
      .send(newVote)
      .expect(200)
      .then(({ body }) => {
        expect(body.article.article_id).toBe(3);
        expect(body.article.title).toBe(
          'Eight pug gifs that remind me of mitch'
        );
        expect(body.article.topic).toBe('mitch');
        expect(body.article.author).toBe('icellusedkars');
        expect(body.article.body).toBe('some gifs');
        expect(typeof body.article.created_at).toBe('string');
        expect(body.article.votes).toBe(10);
        expect(typeof body.article.article_img_url).toBe('string');
      });
  });
  test('PATCH:400 responds with an appropriate status and error message when provided with a bad request (invalid votes input)', () => {
    const newVote = {
      inc_votes: 'not-a-valid-vote',
    };
    return request(app)
      .patch('/api/articles/1')
      .send(newVote)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe('Bad request, invalid input for updating votes');
      });
  });
  test('PATCH:400 responds with an appropriate status and error message when provided with a bad request (invalid article id)', () => {
    const newVote = {
      inc_votes: 10,
    };
    return request(app)
      .patch('/api/articles/not-a-valid-id')
      .send(newVote)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe('Bad request');
      });
  });
});

describe('DELETE/api/comments/:comment_id', () => {
  test('DELETE:204 deletes the specified comment by comment id and sends no body back', () => {
    return request(app).delete('/api/comments/1').expect(204);
  });
  test('DELETE:404 responds with status and error message when given a non-existent id', () => {
    return request(app)
      .delete('/api/comments/99999')
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe('Comment not found');
      });
  });
  test('DELETE:400 responds with status and error message when given an invalid id', () => {
    return request(app)
      .delete('/api/comments/not-an-id')
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe('Bad request');
      });
  });
});

describe('GET/api/users', () => {
  test('GET:200 and sends array of all users with properties matching those tested', () => {
    return request(app)
      .get('/api/users')
      .expect(200)
      .then(({ body }) => {
        expect(body.users).toHaveLength(4);
        body.users.forEach((user) => {
          expect(typeof user.username).toBe('string');
          expect(typeof user.name).toBe('string');
          expect(typeof user.avatar_url).toBe('string');
        });
      });
  });
});

describe('GET/api/articles?topic', () => {
  test('GET:200 and returns all articles filtered by the topic put in query', () => {
    return request(app)
      .get('/api/articles?topic=cats')
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toHaveLength(1);
        body.articles.forEach((article) => {
          expect(typeof article.article_id).toBe('number');
          expect(typeof article.title).toBe('string');
          expect(article.topic).toBe('cats');
          expect(typeof article.author).toBe('string');
          expect(typeof article.created_at).toBe('string');
          expect(typeof article.votes).toBe('number');
          expect(typeof article.article_img_url).toBe('string');
          expect(typeof article.comment_count).toBe('number');
        });
      });
  });
  test('GET:200 and returns an empty array if no articles exists for the topic that was input', () => {
    return request(app)
      .get('/api/articles?topic=paper')
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toHaveLength(0);
        expect(body.articles).toEqual([]);
      });
  });
  test('GET:404 sends a status and error message when given an invalid topic', () => {
    return request(app)
      .get('/api/articles?topic=not-a-topic')
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe('Bad request - not a valid query');
      });
  });
  test('GET:404 sends a status and error message when given an invalid input topic query keyword', () => {
    return request(app)
      .get('/api/articles?not-a-valid-topic=cats')
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe('Bad request - not a valid query');
      });
  });
  test('GET:400 sends a status and error message when given a blank input for topic', () => {
    return request(app)
      .get('/api/articles?topic=')
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe('Bad request - not a valid topic input');
      });
  });
});

describe('GET/api/articles?sort_by', () => {
  test('GET:200 return the articles with query sorted by the table column heading', () => {
    return request(app)
      .get('/api/articles?sort_by=title')
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toHaveLength(13);
        expect(body.articles).toBeSortedBy('title', { descending: true });
      });
  });
  test('GET:404 invalid sort_by if sort_by value input does not exist', () => {
    return request(app)
      .get('/api/articles?sort_by=notvalid')
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe('Bad request - not a valid query');
      });
  });
  test('GET:404 invalid key input if query key does not exist', () => {
    return request(app)
      .get('/api/articles?notvalid=title')
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe('Bad request - not a valid query');
      });
  });
});

describe('GET/api/articles?order', () => {
  test('GET:200 returns articles ordered by the input asc', () => {
    return request(app)
      .get('/api/articles?order=asc')
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toHaveLength(13);
        expect(body.articles).toBeSortedBy('created_at');
      });
  });
  test('GET:404 error response if input order value does not exist', () => {
    return request(app)
      .get('/api/articles?order=notavalue')
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe('Bad request - not a valid query');
      });
  });
  test('GET:404 error response if input order key is not valid', () => {
    return request(app)
      .get('/api/articles?invalid=asc')
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe('Bad request - not a valid query');
      });
  });
});

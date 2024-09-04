# NC News API

## Description

NC News API is built with Express.js, serving as the backend for the SuperNews project. Developed during the Northcoders bootcamp, this API provides a comprehensive set of endpoints for managing and retrieving news articles, comments, votes and other data.
The frontend for this project can be found [here](https://github.com/sidendev/supernews).

## Table of Contents

- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Setup](#setup)
- [Testing](#testing)
- [API Endpoints](#api-endpoints)
- [Contributing](#contributing)

## Technologies Used

- Node.js
- Express.js
- PostgreSQL
- Jest
- Supertest

## Installation

To clone the project, use the following command:

git clone https://github.com/sidendev/nc-news.git

After cloning, install the dependencies:

cd nc-news npm install

## Setup

Set up the database environment variables:

Create two files at the root level: `.env.test` and `.env.development`.

In each file, set up the connection to PGDATABASE:

For `.env.test`:
PGDATABASE="test-database-name-here"

For `.env.development`:
PGDATABASE="dev-database-name-here"

Create the databases:
npm run setup-dbs

Seed the development database:
npm run seed

## Testing

This project uses Jest for testing. To run the tests:

npm test

The test suite covers various scenarios including:

- API endpoints functionality
- Error handling
- Data integrity
- Database operations

## API Endpoints

The API provides various endpoints for interacting with the news database. Some key endpoints include:

- GET /api/topics
- GET /api/articles
- GET /api/articles/:article_id
- POST /api/articles/:article_id/comments
- PATCH /api/articles/:article_id
- GET /api/users

For a complete list of endpoints and their functionalities, refer to the endpoints.json file.

## Contributing

I'm not really looking for contributions at the moment, but if you'd like to fork the repo and make your own changes and expand upon it, that would be great.

---

Developed as part of the [Northcoders](https://northcoders.com/) Digital Skills Bootcamp in Software Engineering.

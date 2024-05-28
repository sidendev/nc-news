# Northcoders News API

## Instructions for set up:

### To Clone The Project

From the github repository, click the "code" button and download the zip file of the repository. Alternatively, you can clone the repository using the following line in your terminal:

```
git clone https://github.com/sidendev/nc-news.git
```

### Setup Environment For Connecting To Databases

You now need to set up the database with environment variables. Create two files at root level titled .env.test and .env.development and make sure it is placed in the main file structure.

Current database names can be found in the setup.sql file.

inside each file you will need to set up connection to PGDATABASE as follows, insert the correct database name for each database:

```
 insert into .env.test file =
 PGDATABASE=<test-database-name-here>

 insert into .env.development file =
 PGDATABASE=<dev-database-name-here>
```

---

This portfolio project was created as part of a Digital Skills Bootcamp in Software Engineering provided by [Northcoders](https://northcoders.com/)

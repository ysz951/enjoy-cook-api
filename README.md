# Enjoy Cook
An online recipes search & share app. Find you want, make you like!

This is the back end for `Enjoy Cook`. The front end can be found at https://github.com/ysz951/enjoy-cook-app.

## Features
* Search recipes by category or keyword.
* Easy to log in and register.
* Add the recipes you like to your favorites link.
* Display the number of comments of the recipe in real time.
* Post, edit or delete your comments about the recipe.

## Demo
* [Live Demo](https://enjoy-cook-app.vercel.app/)

### Demo user automatically log in
* Click `Demo user login` button on `login` page.

### Demo credentials 
* `User name`: `test`
* `Password`: `password`

## Screenshoots
### Home page: 
![image](https://github.com/ysz951/enjoy-cook-app/blob/master/demo_images/mobile_home.png)

### Main Page:
![image](https://github.com/ysz951/enjoy-cook-app/blob/master/demo_images/mobile_search.png)

### Recipe Page:
![image](https://github.com/ysz951/enjoy-cook-app/blob/master/demo_images/mobile_recipe.png)

## Setting Up

- Install dependencies: `npm install`
- Create development and test databases: `createdb enjoycook`, `createdb enjoycook-test`
- Create database user: `createuser enjoycook_server`
- Grant privileges to new user in `psql`:
  - `GRANT ALL PRIVILEGES ON DATABASE "enjoycook" TO enjoycook_server`
  - `GRANT ALL PRIVILEGES ON DATABASE "enjoycook-test" TO enjoycook_server`
- Prepare environment file: `cp example.env .env`
- Replace values in `.env` with your custom values.
- Bootstrap development database: `npm run migrate`
- Bootstrap test database: `npm run migrate:test`
- Clean database `npm run migrate -- 0`
- `.env` file should at list inclue 
```
NODE_ENV=development
PORT=8000
DATABASE_URL="postgresql://enjoycook_server@localhost/enjoycook"
TEST_DATABASE_URL="postgresql://enjoycook_server@localhost/enjoycook-test"
JWT_SECRET="change-this-secrect"
JWT_EXPIRY="3h".
```

### Configuring Postgres

For tests involving time to run properly, your Postgres database must be configured to run in the UTC timezone.

1. Locate the `postgresql.conf` file for your Postgres installation.
    - OS X, Homebrew: `/usr/local/var/postgres/postgresql.conf`
2. Uncomment the `timezone` line and set it to `UTC` as follows:

```
# - Locale and Formatting -

datestyle = 'iso, mdy'
#intervalstyle = 'postgres'
timezone = 'UTC'
#timezone_abbreviations = 'Default'     # Select the set of available time zone
```

## Sample Data

- To seed the database for development: `psql -U enjoycook_server -d enjoycook -a -f seeds/seed.enjoycook_tables.sql`
- To clear seed data: `psql -U enjoycook_server -d enjoycook -a -f seeds/trunc.enjoycook_tables.sql`

## Scripts

- Start application for development: `npm run dev`
- Run tests: `npm test`

## API Endpotins
### POST `/api/auth/login`

```js
// req.body
{
  username: String,
  password: String
}

// res.body
{
  authToken: String
}
```

### POST `/api/auth/refresh`

```js
// req.header
Authorization: Bearer ${token}

// res.body
{
  authToken: ${token}
}
```

### POST `/api/users/`

```js
// req.body
{
  username: String,
  password: String
}

// res.body
{
  name: String,
  username: String,
  date_created: Date
}
```

### Get `/api/users/collections`

```js
// req.user
{
  id: ID
}

// res.body
{
  rec_id: ID,
  collector_id: ID
}
```

### Post `/api/users/collections`

```js
// req.user
{
  id: ID
}

// req.body
{
  rec_id: ID,
}

// res.body
{
  rec_id: ID,
  collector_id: ID
}
```

### Delete `/api/users/collections/:rec_id`

```js
// req.user
{
  id: ID
}

// req.params
{
  rec_id: ID,
}

// res.body
{
  status: 204
}
```

### Get `/api/search/:query`

```js
// req.params
{
  query: String,
}

// res.body
[
 {
  id: ID,
  name: String,
  content: String,
  img_src: String,
  category: String,
  date_created: Date,
  number_of_comments: Number,
  author: {
            id: ID,
            user_name: String,
            date_created: Date,
            date_modified: Date
  }
 }
]
```

### Get `/api/categories`

```js
// res.body
[
 {
  id: ID,
  name: String
 }
]
```

### Get `/api/categories/:category_id`

```js
// req.params
{
  category_id: ID,
}

// res.body
[
 {
  id: ID,
  name: String,
  content: String,
  img_src: String,
  category: String,
  date_created: Date,
  number_of_comments: Number,
  author: {
            id: ID,
            user_name: String,
            date_created: Date,
            date_modified: Date
  }
 }
]
```

### Get `/api/recipes`

```js
// res.body
[
 {
  id: ID,
  name: String,
  content: String,
  img_src: String,
  category: String,
  date_created: Date,
  number_of_comments: Number,
  author: {
            id: ID,
            user_name: String,
            date_created: Date,
            date_modified: Date
  }
 }
]
```

### Get `/api/recipes/:recipe_id`

```js
// req.params
{
  recipe_id: ID,
}

// res.body
{
  id: ID,
  name: String,
  content: String,
  img_src: String,
  category: String,
  date_created: Date,
  number_of_comments: Number,
  author: {
            id: ID,
            user_name: String,
            date_created: Date,
            date_modified: Date
  }
}
```

### Get `/api/recipes/:recipe_id/comments`

```js
// req.params
{
  recipe_id: ID,
}

// res.body
[
 {
   id: ID,
   recipe_id: String,
   content: String,
   date_created: Date,
   author: {
             id: ID,
             user_name: String,
             date_created: Date,
             date_modified: Date
   }
 }
]
```

### Post `/api/comments`

```js
// req.user
{
  id: Id,
}

// req.body
{
  recipe_id: ID,
  content: String,
}

// res.body
{
  id: ID,
  recipe_id: String,
  content: String,
  date_created: Date,
  author: {
            id: ID,
            user_name: String,
            date_created: Date,
            date_modified: Date
  }
}
```

### Delete `/api/comments/:comment_id`

```js
// req.params
{
  comment_id: ID,
}

// res.body
{
  status: 204
}
```

### Patch `/api/comments/:comment_id`

```js
// req.user
{
  id: ID,
}

// req.params
{
  comment_id: ID,
}

// req.body
{
  recipe_id: ID,
  content: String
}

// res.body
{
  status: 204
}
```
## Built With
### Front-End
* #### HTML
  * Interactive Web
* #### CSS
  * Resonsive Layout
* #### React
  * Create React App
  * React Router
  * React Context
### Back-End
* #### Node and Express
  * Authentication via JWT
  * Restful API
* #### DataBase
  * Postgres SQL
  * Knex.js - SQL query builder

## Author
* **Shengyang Zhou** --- _Full-Stack_ --- [ysz951](https://github.com/ysz951)

# Enjoy Cook
An online recipes search & share app. Find you want, make you like!

This is the back end for `Enjoy Cook`. The front end can be found at https://github.com/ysz951/enjoy-cook-app.

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

## Built With
### Back-End
* #### Node and Express
  * Authentication via JWT
  * Restful API
* #### DataBase
  * Postgres SQL
  * Knex.js - SQL query builder

## Author
* **Shengyang Zhou** --- Back-End Development/testing

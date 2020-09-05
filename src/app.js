const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const recipesRouter = require('./recipes/recipes-router');
const commentsRouter = require('./comments/comments-router');
const categoriesRouter = require('./categories/categories-router');
const searchRouter = require('./search/search-router');
const authRouter = require('./auth/auth-router');
const usersRouter = require('./users/users-router');
const awsRouter = require('./aws-router');
const { NODE_ENV } = require('./config');

const app = express();

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());

app.get('/', (req, res) => {
    res.send('Hello, world!')
});
app.use('/api/recipes', recipesRouter);
app.use('/api/comments', commentsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/search', searchRouter);
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/aws', awsRouter);

app.use(function errorHandler(error, req, res, next) {
    let response;
    if (NODE_ENV === 'production') {
        response = { error: { message: 'server error' } };
    } else {
        console.error(error);
        response = { message: error.message, error };
    }
    res.status(500).json(response);
});

module.exports = app;
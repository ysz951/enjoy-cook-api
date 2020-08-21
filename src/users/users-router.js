const express = require('express');
const path = require('path');
const UsersService = require('./users-service');
const { requireAuth } = require('../middleware/jwt-auth');

const usersRouter = express.Router();
const jsonBodyParser = express.json();

usersRouter
  .post('/', jsonBodyParser, (req, res, next) => {
    const { password, user_name } = req.body;

    for (const field of ['user_name', 'password'])
      if (!req.body[field])
        return res.status(400).json({
          error: `Missing '${field}' in request body`
        });

    const passwordError = UsersService.validatePassword(password);

    if (passwordError)
      return res.status(400).json({ error: passwordError });
    
    const userNameError = UsersService.validateUserName(user_name);

    if (userNameError)
      return res.status(400).json({error: userNameError});

    UsersService.hasUserWithUserName(
      req.app.get('db'),
      user_name
    )
      .then(hasUserWithUserName => {
        if (hasUserWithUserName)
          return res.status(400).json({ error: `Username already taken` });

        return UsersService.hashPassword(password)
          .then(hashedPassword => {
            const newUser = {
              user_name,
              password: hashedPassword,
              date_created: 'now()',
            }

            return UsersService.insertUser(
              req.app.get('db'),
              newUser
            )
              .then(user => {
                res
                  .status(201)
                  .location(path.posix.join(req.originalUrl, `/${user.id}`))
                  .json(UsersService.serializeUser(user))
              })
          })
      })
      .catch(next)
  })
usersRouter
  .route('/collections')
  .get(requireAuth, (req, res, next) => {
      UsersService.getRecipesForCollector(
      req.app.get('db'),
      req.user.id
    )
      .then(comments => {
        res.json(comments)
      })
      .catch(next)
  })
  .post(requireAuth, jsonBodyParser, (req, res, next) => {
    const { rec_id } = req.body;
    const newRecipe = { rec_id };

    for (const [key, value] of Object.entries(newRecipe))
      if (value == null)
        return res.status(400).json({
          error: `Missing '${key}' in request body`
        });

    newRecipe.collector_id = req.user.id;

    UsersService.insertRecipeForCollector(
      req.app.get('db'),
      newRecipe
    )
      .then(comment => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${comment.rec_id}`))
          .json(UsersService.serializeRecipe(comment))
      })
      .catch(next)
    })
usersRouter
  .route('/collections/:rec_id')
  .all(requireAuth)
  .all(checkUserRecipeExists)
  .delete(jsonBodyParser, (req, res, next) => {
    
    UsersService.deleteRecipeForuser(
      req.app.get('db'),
      req.user.id,
      req.params.rec_id
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })
async function checkUserRecipeExists(req, res, next) {
  try {
    const rec = await UsersService.getRecipeForUser(
      req.app.get('db'),
      req.user.id,
      req.params.rec_id
    )
    if (!rec)
      return res.status(404).json({
        error: `User doesn't exist`
      });
    next();
  } catch (error) {
    next(error);
  }
};
module.exports = usersRouter;

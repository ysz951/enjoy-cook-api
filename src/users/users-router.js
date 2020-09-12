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
  .route('/recipes')
  .get(requireAuth, (req, res, next) => {
      UsersService.getAllRecipesForUser(
      req.app.get('db'),
      req.user.id
    )
      .then(recipes => {
        res.json(recipes.map(UsersService.serializeRecipe))
      })
      .catch(next)
})

usersRouter
  .route('/recipes/:rec_id')
  .all(requireAuth)
  .all(checkAuthorRecipeExists)
  .get(jsonBodyParser, (req, res,next) => {
    res.json(UsersService.serializeRecipe(res.rec))
  })
  .patch(jsonBodyParser, (req, res,next) => {
    const { name, content, img_src } = req.body;
    const newRecipe = { name, content, img_src };
    console.log('patch')
    for (const [key, value] of Object.entries(newRecipe))
      if (value == null)
        return res.status(400).json({
          error: `Missing '${key}' in request body`
        });
    newRecipe.author_id = req.user.id;
    newRecipe.category_id = req.body.category_id;
    UsersService.updateRecipeForAuthor(
      req.app.get('db'),
      req.user.id,
      req.params.rec_id,
      newRecipe
    )
    .then(numRowsAffected => {
      res.status(204).end()
    })
    .catch(next)
  })
  .delete(jsonBodyParser, (req, res, next) => {
    UsersService.deleteRecipeForAuthor(
      req.app.get('db'),
      req.user.id,
      req.params.rec_id
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })
  
usersRouter
  .route('/collections/recipes')
  .get(requireAuth, (req, res, next) => {
      UsersService.getRecipesForCollector(
      req.app.get('db'),
      req.user.id
    )
      .then(collections => {
        res.json(collections.map(UsersService.serializeRecipe))
      })
      .catch(next)
  })

usersRouter
  .route('/collections/recipe_set')
  .get(requireAuth, (req, res, next) => {
      UsersService.getRecipeSetForCollector(
      req.app.get('db'),
      req.user.id
    )
      .then(collections => {
        res.json(collections.map(UsersService.serializeCollection))
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
      .then(collection => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${collection.rec_id}`))
          .json(UsersService.serializeCollection(collection))
      })
      .catch(next)
    })
usersRouter
  .route('/collections/recipe_set/:rec_id')
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

async function checkAuthorRecipeExists(req, res, next) {
  try {
    const rec = await UsersService.getRecipeForUserById(
      req.app.get('db'),
      req.user.id,
      req.params.rec_id
    )
    if (!rec)
      return res.status(404).json({
        error: `User doesn't exist`
      });
    console.log(rec.author.id, req.user.id)
    if (rec.author.id !== req.user.id)
      return res.status(404).json({
        error: `No authorization`
    });
    res.rec = rec;
    next();
  } catch (error) {
    next(error);
  }
};

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
    if (rec.collector_id !== req.user.id)
      return res.status(404).json({
        error: `No authorization`
    });
    next();
  } catch (error) {
    next(error);
  }
};
module.exports = usersRouter;

const express = require('express');
const RecipesService = require('./recipes-service');
const path = require('path');
const recipesRouter = express.Router();
const { requireAuth } = require('../middleware/jwt-auth');
const jsonBodyParser = express.json();

recipesRouter
  .route('/')
  .get((req, res, next) => {
    RecipesService.getAllRecipes(req.app.get('db'))
      .then(recipes => {
        res.json(recipes.map(RecipesService.serializeRecipe))
      })
      .catch(next)
  })
  .post(requireAuth, jsonBodyParser, (req, res, next) => {
    const { name, content } = req.body;
    const newRecipe = { name, content };

    for (const [key, value] of Object.entries(newRecipe))
      if (value == null)
        return res.status(400).json({
          error: `Missing '${key}' in request body`
        });
    newRecipe.author_id = req.user.id;
    newRecipe.category_id = req.body.category_id;
    newRecipe.img_src = req.body.img_src;
    RecipesService.insertRecipe(
      req.app.get('db'),
      newRecipe
    )
      .then(recipe => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${recipe.id}`))
          .json(RecipesService.serializeRecipe(recipe))
      })
      .catch(next)
    })

// recipesRouter
//   .route('/author')
//   .get(requireAuth, (req, res, next) => {
//     RecipesService
//   })

recipesRouter
  .route('/:recipe_id')
  .all(checkRecipeExists)
  .get((req, res) => {
    res.json(RecipesService.serializeRecipe(res.recipe))
  })

recipesRouter
  .route('/:recipe_id/comments/')
  .all(checkRecipeExists)
  .get((req, res, next) => {
    RecipesService.getCommentsForRecipe(
      req.app.get('db'),
      req.params.recipe_id
    )
      .then(comments => {
        res.json(comments.map(RecipesService.serializeRecipeComment))
      })
      .catch(next)
  })

/* async/await syntax for promises */
async function checkRecipeExists(req, res, next) {
  try {
    const recipe = await RecipesService.getById(
      req.app.get('db'),
      req.params.recipe_id
    )

    if (!recipe)
      return res.status(404).json({
        error: `Recipe doesn't exist`
      });

    res.recipe = recipe;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = recipesRouter;

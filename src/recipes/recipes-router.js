const express = require('express');
const RecipesService = require('./recipes-service');
const recipesRouter = express.Router();

recipesRouter
  .route('/')
  .get((req, res, next) => {
    RecipesService.getAllRecipes(req.app.get('db'))
      .then(recipes => {
        res.json(recipes.map(RecipesService.serializeRecipe))
      })
      .catch(next)
  })

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

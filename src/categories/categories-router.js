const express = require('express')
const CategoriesService = require('./categories-service')

const categoriesRouter = express.Router()

categoriesRouter
  .route('/')
  .get((req, res, next) => {
    CategoriesService.getAllCategories(req.app.get('db'))
      .then(categories => {
        res.json(categories.map(CategoriesService.serializeCategory))
      })
      .catch(next)
  })

categoriesRouter.route('/:category_id/')
  .all(checkCategorieExists)
  .get((req, res, next) => {
    CategoriesService.getRecipesForCategory(
      req.app.get('db'),
      req.params.category_id
    )
      .then(recipes => {
        res.json(recipes.map(CategoriesService.serializeRecipe))
      })
      .catch(next)
  })
/* async/await syntax for promises */
async function checkCategorieExists(req, res, next) {
  try {
    // const recipe = await CategoriesService.getById(
    //   req.app.get('db'),
    //   req.params.categorie_id
    // )
    const categorie = await CategoriesService.getById(
        req.app.get('db'),
        req.params.category_id
    )
    if (!categorie)
      return res.status(404).json({
        error: `Categorie doesn't exist`
      })

    res.categorie = categorie
    next()
  } catch (error) {
    next(error)
  }
}

module.exports = categoriesRouter

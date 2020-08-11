const express = require('express')
const SearchService = require('./search-service')

const searchRouter = express.Router()

searchRouter
  .route('/:name')
  .get((req, res, next) => {
    SearchService.getRecipesForSearch(req.app.get('db'), req.params.name)
      .then(recipes => {
        res.json(recipes.map(SearchService.serializeRecipe))
      })
      .catch(next)
  })

  module.exports = searchRouter
const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')

describe('Categories Endpoints', function() {
  let db
  const {
    testUsers,
    testRecipes,
    testCategories,
    testComments,
  } = helpers.makeRecipesFixtures()
  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    })
    app.set('db', db)
  })

  after('disconnect from db', () => db.destroy())

  before('cleanup', () => helpers.cleanTables(db))

  afterEach('cleanup', () => helpers.cleanTables(db))

  describe(`GET /api/categories`, () => {
    context(`Given no categories`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get('/api/categories')
          .expect(200, [])
      })
    })

    context('Given there are categories in the database', () => {
      beforeEach('insert categories', () =>
        helpers.seedCategories(db, testCategories)
      )
      it('responds with 200 and all of the categories', () => {
        const expectedCategories = testCategories.map(category =>
          helpers.makeExpectedCategory(
            category,
          )
        )
        return supertest(app)
          .get('/api/categories')
          .expect(200, expectedCategories)
      })
    })
  })

  describe(`GET /api/categories/:categoy_id`, () => {
    context(`Given no categories`, () => {
      it(`responds with 404`, () => {
        const categoryId = 123456
        return supertest(app)
          .get(`/api/categories/${categoryId}`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(404, { error: `Category doesn't exist` })
      })
    })

    context('Given there are categories in the database', () => {
      beforeEach('insert categories', () =>
        helpers.seedRecipesTables(
          db,
          testUsers,
          testRecipes,
          testCategories,
          testComments,
        )
      )
      it('responds with 200 and the specified recipe', () => {
        const categoryId = 1
        const expectedCategoryRecipes = helpers.makeExpectedCategoryRecipes(
          testUsers,
          testRecipes,
          testCategories,
          categoryId,
          testComments,
        )
        return supertest(app)
          .get(`/api/categories/${categoryId}`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(200, expectedCategoryRecipes)
      })
    })
  })
})

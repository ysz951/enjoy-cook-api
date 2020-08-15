const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')

describe('Search Endpoints', function() {
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

  describe(`GET /api/search/:query`, () => {
    context('Given there are recipes in the database', () => {
      beforeEach('insert recipes', () =>
        helpers.seedRecipesTables(
          db,
          testUsers,
          testRecipes,
          testCategories,
          testComments,
        )
      )
      it('responds with 200 and the specified recipe', () => {
        const query = 'ak'
        const expectedSearchRecipes = helpers.makeExpectedSearchRecipes(
          testUsers,
          testRecipes,
          testCategories,
          query,
          testComments,
        )
        return supertest(app)
          .get(`/api/search/${query}`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(200, expectedSearchRecipes)
      })
    })

  })
})

const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')

describe('Recipes Endpoints', function() {
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

  describe(`GET /api/recipes`, () => {
    context(`Given no recipes`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get('/api/recipes')
          .expect(200, [])
      })
    })

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
      it('responds with 200 and all of the recipes', () => {
        const expectedRecipes = testRecipes.map(recipe =>
          helpers.makeExpectedRecipe(
            testUsers,
            recipe,
            testCategories,
            testComments,
          )
        )
        return supertest(app)
          .get('/api/recipes')
          .expect(200, expectedRecipes)
      })
    })

    context(`Given an XSS attack recipe`, () => {
      const testUser = helpers.makeUsersArray()[0]
      const testCategory = helpers.makeCategoriesArray()[0]
      const {
        maliciousRecipe,
        expectedRecipe,
      } = helpers.makeMaliciousRecipe(testUser, testCategory)
      beforeEach('insert malicious recipe', () => {
        return helpers.seedMaliciousRecipe(
          db,
          testUser,
          maliciousRecipe,
          testCategory,
        )
      })

      it('removes XSS attack content', () => {
        return supertest(app)
          .get(`/api/recipes`)
          .expect(200)
          .expect(res => {
            expect(res.body[0].name).to.eql(expectedRecipe.name)
            expect(res.body[0].content).to.eql(expectedRecipe.content)
          })
      })
    })
  })
  describe(`POST /api/comments`, () => {
    beforeEach('insert comments', () =>
      helpers.seedRecipesTables(
        db,
        testUsers,
        testRecipes,
        testCategories,
      )
    )

    it(`creates an recipe, responding with 201 and the new recipe`, function() {
      this.retries(2)
      const testUser = testUsers[0]
      const newComment = {
        name: 'test name',
        content: 'Test new recipe',
        author_id: testUser.id,
        step: [['test', '1']]
      }
      return supertest(app)
        .post('/api/recipes')
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .send(newComment)
        .expect(201)
        .expect(res => {
          expect(res.body).to.have.property('id')
          expect(res.body.content).to.eql(newComment.content)
          expect(res.body.step).to.eql(newComment.step)
          expect(res.headers.location).to.eql(`/api/recipes/${res.body.id}`)
          const expectedDate = new Date().toLocaleString('en', { timeZone: 'UTC' })
          const actualDate = new Date(res.body.date_created).toLocaleString()
          expect(actualDate).to.eql(expectedDate)
        })
        .expect(res =>
          db
            .from('enjoycook_recipes')
            .select('*')
            .where({ id: res.body.id })
            .first()
            .then(row => {
              expect(row.content).to.eql(newComment.content)
              expect(row.step).to.eql(newComment.step)
              const expectedDate = new Date().toLocaleString('en', { timeZone: 'UTC' })
              const actualDate = new Date(row.date_created).toLocaleString()
              expect(actualDate).to.eql(expectedDate)
            })
        )
    })
  })
  describe(`GET /api/recipes/:recipe_id`, () => {
    context(`Given no recipes`, () => {
      it(`responds with 404`, () => {
        const recipeId = 123456
        return supertest(app)
          .get(`/api/recipes/${recipeId}`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(404, { error: `Recipe doesn't exist` })
      })
    })

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
        const recipeId = 2
        const expectedRecipe = helpers.makeExpectedRecipe(
          testUsers,
          testRecipes[recipeId - 1],
          testCategories,
          testComments,
        )

        return supertest(app)
          .get(`/api/recipes/${recipeId}`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(200, expectedRecipe)
      })
    })

    context(`Given an XSS attack recipe`, () => {
      const testUser = helpers.makeUsersArray()[0]
      const testCategory = helpers.makeCategoriesArray()[0]
      const {
        maliciousRecipe,
        expectedRecipe,
      } = helpers.makeMaliciousRecipe(testUser, testCategory )

      beforeEach('insert malicious recipe', () => {
        return helpers.seedMaliciousRecipe(
          db,
          testUser,
          maliciousRecipe,
          testCategory,
        )
      })

      it('removes XSS attack content', () => {
        return supertest(app)
          .get(`/api/recipes/${maliciousRecipe.id}`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200)
          .expect(res => {
            expect(res.body.name).to.eql(expectedRecipe.name)
            expect(res.body.content).to.eql(expectedRecipe.content)
          })
      })
    })
  })

  describe(`GET /api/recipes/:recipe_id/comments`, () => {
    context(`Given no recipes`, () => {
      it(`responds with 404`, () => {
        const recipeId = 123456
        return supertest(app)
          .get(`/api/recipes/${recipeId}/comments`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(404, { error: `Recipe doesn't exist` })
      })
    })

    context('Given there are comments for recipe in the database', () => {
      beforeEach('insert recipes', () =>
        helpers.seedRecipesTables(
          db,
          testUsers,
          testRecipes,
          testCategories,
          testComments,
        )
      )

      it('responds with 200 and the specified comments', () => {
        const recipeId = 1
        const expectedComments = helpers.makeExpectedRecipeComments(
          testUsers, recipeId, testComments
        )

        return supertest(app)
          .get(`/api/recipes/${recipeId}/comments`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(200, expectedComments)
      })
    })
  })
})

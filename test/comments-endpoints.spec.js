const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')
const { expect } = require('chai')

describe('Comments Endpoints', function() {
  let db

  const {
    testRecipes,
    testUsers,
    testCategories,
    testComments,
  } = helpers.makeRecipesFixtures()

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL,
    })
    app.set('db', db)
  })

  after('disconnect from db', () => db.destroy())

  before('cleanup', () => helpers.cleanTables(db))

  afterEach('cleanup', () => helpers.cleanTables(db))
  describe(`GET /api/comments`, () => {
    context('Given there are comments in the database', () => {
      beforeEach('insert comments', () =>
        helpers.seedRecipesTables(
          db,
          testUsers,
          testRecipes,
          testCategories,
          testComments,
        )
      )
      it('responds with 200 and all of the comments', () => {
        const expectedComments = testComments.map(comment => 
          helpers.makeExpectedComment(
            testUsers,
            comment,
          )
        )
        return supertest(app)
          .get('/api/comments')
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(200, expectedComments)
      })
    })
  })
  describe(`GET /api/comments/comment_id`, () => {
    context('Given there are recipes in the database', () => {
      beforeEach('insert comments', () =>
        helpers.seedRecipesTables(
          db,
          testUsers,
          testRecipes,
          testCategories,
          testComments,
        )
      )
      it('responds with 200 and the specified comment', () => {
        const commentId = 1
        const expectedComment = 
          helpers.makeExpectedComment(
            testUsers,
            testComments[commentId - 1],
          )
        
        return supertest(app)
          .get(`/api/comments/${commentId}`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(200, expectedComment)
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

    it(`creates an comment, responding with 201 and the new comment`, function() {
      this.retries(2)
      const testRecipe = testRecipes[0]
      const testUser = testUsers[0]
      const newComment = {
        content: 'Test new comment',
        recipe_id: testRecipe.id,
      }
      return supertest(app)
        .post('/api/comments')
        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
        .send(newComment)
        .expect(201)
        .expect(res => {
          expect(res.body).to.have.property('id')
          expect(res.body.content).to.eql(newComment.content)
          expect(res.body.recipe_id).to.eql(newComment.recipe_id)
          expect(res.body.user.id).to.eql(testUser.id)
          expect(res.headers.location).to.eql(`/api/comments/${res.body.id}`)
          const expectedDate = new Date().toLocaleString('en', { timeZone: 'UTC' })
          const actualDate = new Date(res.body.date_created).toLocaleString()
          expect(actualDate).to.eql(expectedDate)
        })
        .expect(res =>
          db
            .from('enjoycook_comments')
            .select('*')
            .where({ id: res.body.id })
            .first()
            .then(row => {
              expect(row.content).to.eql(newComment.content)
              expect(row.recipe_id).to.eql(newComment.recipe_id)
              expect(row.user_id).to.eql(testUser.id)
              const expectedDate = new Date().toLocaleString('en', { timeZone: 'UTC' })
              const actualDate = new Date(row.date_created).toLocaleString()
              expect(actualDate).to.eql(expectedDate)
            })
        )
    })

    const requiredFields = ['content', 'recipe_id']

    requiredFields.forEach(field => {
      const testRecipe = testRecipes[0]
      const testUser = testUsers[0]
      const newComment = {
        content: 'Test new comment',
        recipe_id: testRecipe.id,
      }

      it(`responds with 400 and an error message when the '${field}' is missing`, () => {
        delete newComment[field]

        return supertest(app)
          .post('/api/comments')
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .send(newComment)
          .expect(400, {
            error: `Missing '${field}' in request body`,
          })
      })
    })
    
  })
  describe(`DELETE /api/comments/:comment_id`, () => {
    context(`Given no comments`, () => {
      it(`responds with 404`, () => {
        const commentId = 123456
        return supertest(app)
          .delete(`/api/comments/${commentId}`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(404, { error: `Comment doesn't exist` })
      })
    })

    context('Given there are comments in the database', () => {
      beforeEach('insert comments', () =>
        helpers.seedRecipesTables(
          db,
          testUsers,
          testRecipes,
          testCategories,
          testComments,
        )
      )
      it('responds with 204 and removes the comment', () => {
        const idToRemove = 1
        const deleteComments = testComments.filter(comment => comment.id !== idToRemove)
        const expectedDeleteComments = deleteComments.map(comment => 
          helpers.makeExpectedComment(
            testUsers,
            comment,
          )
        )
        return supertest(app)
          .delete(`/api/comments/${idToRemove}`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/api/comments`)
              .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
              .expect(expectedDeleteComments)
          )
      })
    })
  })
  describe(`PATCH /api/comments/:comment_id`, () => {
    context('Given there are comments in the database', () => {
      beforeEach('insert comments', () =>
        helpers.seedRecipesTables(
          db,
          testUsers,
          testRecipes,
          testCategories,
          testComments,
        )
      )
      it('responds with 204 and updates the comment', () => {
        const idToUpdate = 1
        const updateComment = {
          content: 'updated comment content',
          recipe_id: testComments[idToUpdate - 1].recipe_id
        }
        const expectedComment =  helpers.makeExpectedComment(
          testUsers,
          {
            ...testComments[idToUpdate - 1],
            ...updateComment,
          },
        )
        return supertest(app)
          .patch(`/api/comments/${idToUpdate}`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .send(updateComment)
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/api/comments/${idToUpdate}`)
              .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
              .expect(expectedComment)
          )
      })
    })
  })
})

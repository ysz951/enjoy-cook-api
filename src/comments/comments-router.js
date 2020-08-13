const express = require('express')
const path = require('path')
const CommentsService = require('./comments-service')
const { requireAuth } = require('../middleware/jwt-auth')

const commentsRouter = express.Router()
const jsonBodyParser = express.json()

commentsRouter
  .route('/')
  .post(requireAuth, jsonBodyParser, (req, res, next) => {
    const { recipe_id, content } = req.body
    const newComment = { recipe_id, content }

    for (const [key, value] of Object.entries(newComment))
      if (value == null)
        return res.status(400).json({
          error: `Missing '${key}' in request body`
        })
    newComment.user_id = req.user.id
    
    CommentsService.insertComment(
      req.app.get('db'),
      newComment
    )
      .then(comment => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${comment.id}`))
          .json(CommentsService.serializeComment(comment))
      })
      .catch(next)
    })
commentsRouter
  .route('/:comment_id')
  .all(checkCommentExists)
  .delete(requireAuth, jsonBodyParser, (req, res, next) => {
    CommentsService.deleteComment(
      req.app.get('db'),
      req.params.comment_id
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })
  .patch(requireAuth, jsonBodyParser, (req, res, next) => {
    const { recipe_id, content } = req.body
    const CommentToUpdate = { recipe_id, content }

    for (const [key, value] of Object.entries(CommentToUpdate))
      if (value == null)
        return res.status(400).json({
          error: `Missing '${key}' in request body`
        })
    CommentToUpdate.user_id = req.user.id
    // CommentToUpdate.user_id = 1
    CommentsService.updateComment(
      req.app.get('db'),
      req.params.comment_id,
      CommentToUpdate
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })
async function checkCommentExists(req, res, next) {
  try {
    const comment = await CommentsService.getById(
        req.app.get('db'),
        req.params.comment_id
    )
    if (!comment)
      return res.status(404).json({
        error: `Comment doesn't exist`
      })

    // res.comment = comment
    next()
  } catch (error) {
    next(error)
  }
}
module.exports = commentsRouter

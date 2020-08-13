const express = require('express')
const path = require('path')
const UsersService = require('./users-service')
const { requireAuth } = require('../middleware/jwt-auth')

const usersRouter = express.Router()
const jsonBodyParser = express.json()

usersRouter
  .post('/', jsonBodyParser, (req, res, next) => {
    const { password, user_name, full_name, nickname } = req.body

    for (const field of ['full_name', 'user_name', 'password'])
      if (!req.body[field])
        return res.status(400).json({
          error: `Missing '${field}' in request body`
        })

    // TODO: check user_name doesn't start with spaces

    const passwordError = UsersService.validatePassword(password)

    if (passwordError)
      return res.status(400).json({ error: passwordError })

    UsersService.hasUserWithUserName(
      req.app.get('db'),
      user_name
    )
      .then(hasUserWithUserName => {
        if (hasUserWithUserName)
          return res.status(400).json({ error: `Username already taken` })

        return UsersService.hashPassword(password)
          .then(hashedPassword => {
            const newUser = {
              user_name,
              password: hashedPassword,
              full_name,
              nickname,
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
// usersRouter
//   .route('/:user_id')
//   .all(checkUserExists)
//   .get((req, res) => {
//     res.json(UsersService.serializeUser(res.user))
//   })

usersRouter
  // .route('/:user_id/collections')
  // .all(checkUserExists)
  .route('/collections')
  .get(requireAuth, (req, res, next) => {
      UsersService.getRecipesForCollector(
      req.app.get('db'),
      req.user.id
    )
      .then(comments => {
        res.json(comments)
      })
      .catch(next)
})

// async function checkUserExists(req, res, next) {
//   try {
//     const user = await UsersService.getById(
//       req.app.get('db'),
//       req.params.user_id
//     )

//     if (!user)
//       return res.status(404).json({
//         error: `User doesn't exist`
//       })

//     res.user = user
//     next()
//   } catch (error) {
//     next(error)
//   }
// }
module.exports = usersRouter

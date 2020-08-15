const xss = require('xss')

const CommentsService = {
  getAllComments(db) {
    return db
      .from('enjoycook_comments AS comm')
      .select(
        'comm.id',
        'comm.content',
        'comm.date_created',
        'comm.recipe_id',
        db.raw(
          `json_strip_nulls(
            row_to_json(
              (SELECT tmp FROM (
                SELECT
                  usr.id,
                  usr.user_name,
                  usr.full_name,
                  usr.nickname,
                  usr.date_created,
                  usr.date_modified
              ) tmp)
            )
          ) AS "user"`
        )
      )
      .leftJoin(
        'enjoycook_users AS usr',
        'comm.user_id',
        'usr.id',
      )
  },
  getById(db, id) {
    return CommentsService.getAllComments(db)
      .where('comm.id', id)
      .first()
  },

  insertComment(db, newComment) {
    return db
      .insert(newComment)
      .into('enjoycook_comments')
      .returning('*')
      .then(([comment]) => comment)
      .then(comment =>
        CommentsService.getById(db, comment.id)
      )
  },
  
  deleteComment(db, id) {
    return db('enjoycook_comments')
      .where({id})
      .delete()
  },

  updateComment(db, id, updateComment) {
    return db('enjoycook_comments')
      .where({ id })
      .update(updateComment)
  },

  serializeComment(comment) {
    const { user } = comment
    return {
      id: comment.id,
      content: xss(comment.content),
      recipe_id: comment.recipe_id,
      date_created: new Date(comment.date_created),
      user: {
        id: user.id,
        user_name: user.user_name,
        full_name: user.full_name,
        nickname: user.nickname,
        date_created: new Date(user.date_created),
        date_modified: new Date(user.date_modified) || null
      },
    }
  }
}

module.exports = CommentsService

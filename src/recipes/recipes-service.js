const xss = require('xss')

const RecipesService = {
  getAllRecipes(db) {
    return db
      .from('enjoycook_recipes AS rec')
      .select(
        'rec.id',
        'rec.name',
        'rec.date_created',
        'rec.content',
        'rec.img_src',
        'cate.name AS category',
        db.raw(
          `count(DISTINCT comm) AS number_of_comments`
        ),
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
            ) AS "author"`
        ),
      )
      .leftJoin(
        'enjoycook_comments AS comm',
        'rec.id',
        'comm.recipe_id',
      )
      .leftJoin(
        'enjoycook_users AS usr',
        'rec.author_id',
        'usr.id',
      )
      .leftJoin(
          'enjoycook_categories AS cate',
          'rec.category_id',
          'cate.id'
      )
      .groupBy('rec.id', 'usr.id','cate.id')
  },

  getById(db, id) {
    return RecipesService.getAllRecipes(db)
      .where('rec.id', id)
      .first()
  },

  getCommentsForRecipe(db, recipe_id) {
    return db
      .from('enjoycook_comments AS comm')
      .select(
        'comm.id',
        'comm.content',
        'comm.date_created',
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
      .where('comm.recipe_id', recipe_id)
      .leftJoin(
        'enjoycook_users AS usr',
        'comm.user_id',
        'usr.id',
      )
      .groupBy('comm.id', 'usr.id')
  },

  serializeRecipe(recipe) {
    const { author } = recipe
    return {
      id: recipe.id,
      style: recipe.style,
      name: xss(recipe.name),
      content: xss(recipe.content),
      category: xss(recipe.category) || null,
      img_src: xss(recipe.img_src) || null,
      date_created: new Date(recipe.date_created),
      number_of_comments: Number(recipe.number_of_comments) || 0,
      author: {
        id: author.id,
        user_name: author.user_name,
        full_name: author.full_name,
        nickname: author.nickname,
        date_created: new Date(author.date_created),
        date_modified: new Date(author.date_modified) || null
      },
    }
  },

  serializeRecipeComment(comment) {
    const { user } = comment
    return {
      id: comment.id,
      recipe_id: comment.recipe_id,
      content: xss(comment.content),
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
  },
}

module.exports = RecipesService

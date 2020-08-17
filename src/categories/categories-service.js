const xss = require('xss')

const CategoriesService = {
  getAllCategories(db) {
      return db
          .from('enjoycook_categories')
          .select(
              '*'
          )
  },

  getById(db, id) {
      return CategoriesService.getAllCategories(db)
        .where('id', id)
        .first()
    },

  getRecipesForCategory(db, category_id) {
      return db
        .from('enjoycook_recipes AS rec')
        .select(
          'rec.id',
          'rec.name',
          'rec.date_created',
          'rec.content',
          'rec.img_src',
          'rec.step',
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
        .where('rec.category_id', category_id)
        .groupBy('rec.id', 'usr.id','cate.id')
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
          step: recipe.step || null,
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

  serializeCategory(category) {
      return {
          id: category.id,
          name: xss(category.name),
      }
  },
}

module.exports = CategoriesService

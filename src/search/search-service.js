const xss = require('xss')
const knex = require('knex')
const SearchService = {
    getRecipesForSearch(db, name) {
      return db
        .from('enjoycook_recipes AS rec')
        .select(
          'rec.id',
          'rec.name',
          'rec.date_created',
          'rec.content',
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
        .where(knex.raw(`rec.name ilike ?`, [`%${name}%`]))
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
}

module.exports = SearchService
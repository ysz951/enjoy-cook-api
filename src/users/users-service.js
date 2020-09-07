const bcrypt = require('bcryptjs');
const xss = require('xss');

const REGEX_UPPER_LOWER_NUMBER_SPECIAL = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&])[\S]+/;

const UsersService = {
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

  getAllRecipesForUser(db, user_id) {
    return UsersService.getAllRecipes(db)
      .where('usr.id', user_id)
  },

  getRecipeForUser(db, collector_id, rec_id) {
    return db
      .from('enjoycook_recipes_collectors')
      .select('rec_id')
      .where('collector_id', collector_id).andWhere('rec_id', rec_id)
  },

  deleteRecipeForAuthor(db, author_id, rec_id) {
    console.log('ok')
    return db('enjoycook_recipes')
      .where('id', rec_id).andWhere({author_id})
      .delete()
  },

  deleteRecipeForuser(db, collector_id, rec_id) {
    return db('enjoycook_recipes_collectors')
      .where('collector_id', collector_id).andWhere('rec_id', rec_id)
      .delete()
  },

  getRecipesForCollector(db, collector_id) {
    return UsersService.getAllRecipes(db)
      .join(
        'enjoycook_recipes_collectors AS erc',
        'rec.id',
        'erc.rec_id'
      )
      .where('erc.collector_id', collector_id)
  },

  getRecipeSetForCollector(db, collector_id) {
    return db
      .from('enjoycook_recipes_collectors')
      .select('rec_id')
      .where('collector_id', collector_id)
  },

  insertRecipeForCollector(db, newRecipe) {
    return db
      .insert(newRecipe)
      .into('enjoycook_recipes_collectors')
      .returning('*')
      .then(rows => {
        return rows[0]
      })
  },

  hasUserWithUserName(db, user_name) {
    return db('enjoycook_users')
      .where({ user_name })
      .first()
      .then(user => !!user)
  },
  insertUser(db, newUser) {
    return db
      .insert(newUser)
      .into('enjoycook_users')
      .returning('*')
      .then(([user]) => user)
  },
  validateUserName(user_name) {
    return user_name.length > 15 ? 'User name be less than 15 characters' : null
  },
  validatePassword(password) {
    if (password.length < 8) {
      return 'Password be longer than 8 characters';
    }
    if (password.length > 72) {
      return 'Password be less than 72 characters';
    }
    if (password.startsWith(' ') || password.endsWith(' ')) {
      return 'Password must not start or end with empty spaces';
    }
    if (!REGEX_UPPER_LOWER_NUMBER_SPECIAL.test(password)) {
      return 'Password must contain one upper case, lower case, number and special character';
    }
    return null;
  },
  hashPassword(password) {
    return bcrypt.hash(password, 12);
  },

  serializeCollection(collection) {
    return {
      rec_id: collection.rec_id
    };
  },

  serializeRecipe(recipe) {
    const { author } = recipe
    return {
      id: recipe.id,
      name: xss(recipe.name),
      content: xss(recipe.content),
      category: xss(recipe.category) || null,
      img_src: xss(recipe.img_src) || null,
      date_created: new Date(recipe.date_created),
      number_of_comments: Number(recipe.number_of_comments) || 0,
      author: {
        id: author.id,
        user_name: author.user_name,
        date_created: new Date(author.date_created),
        date_modified: new Date(author.date_modified) || null
      },
    };
  },

  serializeUser(user) {
    return {
      id: user.id,
      full_name: xss(user.full_name),
      user_name: xss(user.user_name),
      nickname: xss(user.nick_name),
      date_created: new Date(user.date_created),
    };
  },
};

module.exports = UsersService;

const bcrypt = require('bcryptjs');
const xss = require('xss');

const REGEX_UPPER_LOWER_NUMBER_SPECIAL = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&])[\S]+/;

const UsersService = {
  getRecipeForUser(db, collector_id, rec_id) {
    return db
      .from('enjoycook_recipes_collectors')
      .select('rec_id')
      .where('collector_id', collector_id).andWhere('rec_id', rec_id)
  },
  deleteRecipeForuser(db, collector_id, rec_id) {
    return db('enjoycook_recipes_collectors')
      .where('collector_id', collector_id).andWhere('rec_id', rec_id)
      .delete()
  },
  getRecipesForCollector(db, collector_id) {
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

  serializeRecipe(recipe) {
    return {
      rec_id: recipe.rec_id
    };
  }
  ,
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

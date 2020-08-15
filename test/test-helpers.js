const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

function makeUsersArray() {
  return [
    {
      id: 1,
      user_name: 'test-user-1',
      full_name: 'Test user 1',
      nickname: 'TU1',
      password: 'password',
      date_created: new Date('2029-01-22T16:28:32.615Z'),
    },
    {
      id: 2,
      user_name: 'test-user-2',
      full_name: 'Test user 2',
      nickname: 'TU2',
      password: 'password',
      date_created: new Date('2029-01-22T16:28:32.615Z'),
    },
    {
      id: 3,
      user_name: 'test-user-3',
      full_name: 'Test user 3',
      nickname: 'TU3',
      password: 'password',
      date_created: new Date('2029-01-22T16:28:32.615Z'),
    },
  ]
}

function makeCategoriesArray() {
    return [
      {
        id: 1,
        name: 'test-category-1',

      },
      {
        id: 2,
        name: 'test-category-2',
      },
    ]
  }

function makeRecipesArray(users, categories) {
  return [
    {
      id: 1,
      name: 'First test recipe!',
      author_id: users[0].id,
      category_id: categories[0].id,
      date_created: new Date('2029-01-22T16:28:32.615Z'),
      content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?',
    },
    {
      id: 2,
      name: 'Second test recipe!',
      author_id: users[1].id,
      category_id: categories[1].id,
      date_created: new Date('2029-01-22T16:28:32.615Z'),
      content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?',
    },
    {
      id: 3,
      name: 'Third test recipe!',
      author_id: users[2].id,
      category_id: null,
      date_created: new Date('2029-01-22T16:28:32.615Z'),
      content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?',
    },
  ]
}

function makeCommentsArray(users, recipes) {
  return [
    {
      id: 1,
      content: 'First test comment!',
      recipe_id: recipes[0].id,
      user_id: users[0].id,
      date_created: new Date('2029-01-22T16:28:32.615Z'),
    },
    {
      id: 2,
      content: 'Second test comment!',
      recipe_id: recipes[0].id,
      user_id: users[1].id,
      date_created: new Date('2029-01-22T16:28:32.615Z'),
    },
    {
      id: 3,
      content: 'Fifth test comment!',
      recipe_id: recipes[recipes.length - 1].id,
      user_id: users[0].id,
      date_created: new Date('2029-01-22T16:28:32.615Z'),
    },
    {
      id: 4,
      content: 'Sixth test comment!',
      recipe_id: recipes[recipes.length - 1].id,
      user_id: users[1].id,
      date_created: new Date('2029-01-22T16:28:32.615Z'),
    },
  ];
}

function makeExpectedCollection(recipes, recipeId) {
  const expectedCollections = recipes.filter(recipe => recipe.id === recipeId)
  return expectedCollections.map(recipe => {
    return {
      rec_id: recipe.id
    }
  })
}

function makeExpectedRecipe(users, recipe, categories, comments=[]) {
  const author = users
    .find(user => user.id === recipe.author_id)

  const number_of_comments = comments
    .filter(comment => comment.recipe_id === recipe.id)
    .length
  const category = categories
    .find(category => category.id === recipe.category_id)
  return {
    id: recipe.id,
    name: recipe.name,
    content: recipe.content,
    date_created: recipe.date_created.toISOString(),
    number_of_comments,
    category: category ? category.name : null,
    author: {
      id: author.id,
      user_name: author.user_name,
      full_name: author.full_name,
      nickname: author.nickname,
      date_created: author.date_created.toISOString(),
      date_modified: author.date_modified || null,
    },
  }
}

function makeExpectedCategoryRecipes(users, recipes, categories, categoryId, comments=[]) {
    const expectedRecipes = recipes
      .filter(recipe => recipe.category_id === categoryId)
  
    return expectedRecipes.map(recipe => {
      const author = users.find(user => user.id === recipe.author_id)
      const category = categories.find(category => category.id === recipe.category_id)
      const number_of_comments = comments
        .filter(comment => comment.recipe_id === recipe.id)
        .length
      return {
        id: recipe.id,
        name: recipe.name,
        content: recipe.content,
        date_created: recipe.date_created.toISOString(),
        number_of_comments,
        category: category ? category.name : null,
        author: {
            id: author.id,
            user_name: author.user_name,
            full_name: author.full_name,
            nickname: author.nickname,
            date_created: author.date_created.toISOString(),
            date_modified: author.date_modified || null,
        }
      }
    })
}

function makeExpectedSearchRecipes(users, recipes, categories, query, comments=[]) {
  const expectedRecipes = recipes
    .filter(recipe => recipe.name.includes(query))

  return expectedRecipes.map(recipe => {
    const author = users.find(user => user.id === recipe.author_id)
    const category = categories.find(category => category.id === recipe.category_id)
    const number_of_comments = comments
      .filter(comment => comment.recipe_id === recipe.id)
      .length
    return {
      id: recipe.id,
      name: recipe.name,
      content: recipe.content,
      date_created: recipe.date_created.toISOString(),
      number_of_comments,
      category: category ? category.name : null,
      author: {
          id: author.id,
          user_name: author.user_name,
          full_name: author.full_name,
          nickname: author.nickname,
          date_created: author.date_created.toISOString(),
          date_modified: author.date_modified || null,
      }
    }
  })
}


function makeExpectedCategory(category) {
  return {
    id: category.id,
    name: category.name,
  }
  
}

function makeExpectedComment(users, comment) {
  const commentUser = users.find(user => user.id === comment.user_id)
  return {
    id: comment.id,
    content: comment.content,
    date_created: comment.date_created.toISOString(),
    recipe_id: comment.recipe_id,
    user: {
      id: commentUser.id,
      user_name: commentUser.user_name,
      full_name: commentUser.full_name,
      nickname: commentUser.nickname,
      date_created: commentUser.date_created.toISOString(),
      date_modified: commentUser.date_modified || null,
    }
  }
}

function makeExpectedRecipeComments(users, recipeId, comments) {
  const expectedComments = comments
    .filter(comment => comment.recipe_id === recipeId)

  return expectedComments.map(comment => {
    const commentUser = users.find(user => user.id === comment.user_id)
    return {
      id: comment.id,
      content: comment.content,
      date_created: comment.date_created.toISOString(),
      user: {
        id: commentUser.id,
        user_name: commentUser.user_name,
        full_name: commentUser.full_name,
        nickname: commentUser.nickname,
        date_created: commentUser.date_created.toISOString(),
        date_modified: commentUser.date_modified || null,
      }
    }
  })
}

function makeMaliciousRecipe(user, category) {
  const maliciousRecipe = {
    id: 911,
    date_created: new Date(),
    category_id: category.id,
    name: 'Naughty naughty very naughty <script>alert("xss");</script>',
    author_id: user.id,
    content: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
  }
  const expectedRecipe = {
    ...makeExpectedRecipe([user], maliciousRecipe, [category]),
    name: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
    content: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`,
  }
  return {
    maliciousRecipe,
    expectedRecipe,
  }
}

function makeRecipesFixtures() {
  const testUsers = makeUsersArray()
  const testCategories = makeCategoriesArray()
  const testRecipes = makeRecipesArray(testUsers, testCategories)
  const testComments = makeCommentsArray(testUsers, testRecipes)
  return { testUsers, testRecipes, testCategories, testComments }
}

function cleanTables(db) {
  return db.transaction(trx =>
    trx.raw(
      `TRUNCATE
        enjoycook_users,
        enjoycook_recipes,
        enjoycook_categories,
        enjoycook_comments,
        enjoycook_recipes_collectors
      `
    )
    .then(() =>
      Promise.all([
        trx.raw(`ALTER SEQUENCE enjoycook_recipes_id_seq minvalue 0 START WITH 1`),
        trx.raw(`ALTER SEQUENCE enjoycook_users_id_seq minvalue 0 START WITH 1`),
        trx.raw(`ALTER SEQUENCE enjoycook_comments_id_seq minvalue 0 START WITH 1`),
        trx.raw(`ALTER SEQUENCE enjoycook_categories_id_seq minvalue 0 START WITH 1`),
        trx.raw(`SELECT setval('enjoycook_recipes_id_seq', 0)`),
        trx.raw(`SELECT setval('enjoycook_users_id_seq', 0)`),
        trx.raw(`SELECT setval('enjoycook_comments_id_seq', 0)`),
        trx.raw(`SELECT setval('enjoycook_categories_id_seq', 0)`),
      ])
    )
  )
}

function seedUsers(db, users) {
  const preppedUsers = users.map(user => ({
    ...user,
    password: bcrypt.hashSync(user.password, 1)
  }))
  return db.into('enjoycook_users').insert(preppedUsers)
    .then(() =>
      // update the auto sequence to stay in sync
      db.raw(
        `SELECT setval('enjoycook_users_id_seq', ?)`,
        [users[users.length - 1].id],
      )
    )
}

function seedCategories(db, categories) {
    return db.into('enjoycook_categories').insert(categories)
     .then(() => 
        db.raw(
            `SELECT setval('enjoycook_categories_id_seq', ?)`,
            [categories[categories.length - 1].id],
        )
     )
}

function seedRecipesTables(db, users, recipes, categories, comments=[]) {
  // use a transaction to group the queries and auto rollback on any failure
  return db.transaction(async trx => {
    await seedUsers(trx, users)
    await seedCategories(trx, categories)
    await trx.into('enjoycook_recipes').insert(recipes)
    // update the auto sequence to match the forced id values
    await trx.raw(
      `SELECT setval('enjoycook_recipes_id_seq', ?)`,
      [recipes[recipes.length - 1].id],
    )
    
    // only insert comments if there are some, also update the sequence counter
    if (comments.length) {
      await trx.into('enjoycook_comments').insert(comments)
      await trx.raw(
        `SELECT setval('enjoycook_comments_id_seq', ?)`,
        [comments[comments.length - 1].id],
      )
    }
  })
}

function seedCollectionsTables(db, users, recipes, categories, newRecipe, comments = []) {
  return db.transaction(async trx => {
    await seedRecipesTables(db, users, recipes, categories, comments)
    await trx.into('enjoycook_recipes_collectors').insert(newRecipe)
  })
}


function seedMaliciousRecipe(db, user, recipe, category) {
    return db.transaction(async trx => {
        await seedUsers(trx, [user])
        await seedCategories(trx, [category])
        await trx.into('enjoycook_recipes').insert([recipe])
    })
}

function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
  const token = jwt.sign({ user_id: user.id }, secret, {
    subject: user.user_name,
    algorithm: 'HS256',
  })
  return `Bearer ${token}`
}

module.exports = {
  makeUsersArray,
  makeRecipesArray,
  makeExpectedRecipe,
  makeExpectedRecipeComments,
  makeExpectedCategoryRecipes,
  makeExpectedCategory,
  makeMaliciousRecipe,
  makeCommentsArray,
  makeCategoriesArray,
  makeRecipesFixtures,
  cleanTables,
  seedRecipesTables,
  seedMaliciousRecipe,
  makeAuthHeader,
  seedUsers,
  seedCategories,
  seedCollectionsTables,
  makeExpectedCollection,
  makeExpectedSearchRecipes,
  makeExpectedComment,
}

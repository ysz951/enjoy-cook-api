BEGIN;

TRUNCATE
  enjoycook_categories,
  enjoycook_users,
  enjoycook_recipes,
  enjoycook_comments,
  enjoycook_recipes_collectors
  RESTART IDENTITY CASCADE;

INSERT INTO enjoycook_categories (name)
VALUES
  ('Breakfast'),
  ('Lunch'),
  ('Dinner');

INSERT INTO enjoycook_users (user_name, password)
VALUES
  ('tony', '$2a$12$.ms8.7X0jD.VcACW8Yi.k.lZGvbezTtTJijX16NlrrJl1jzo0IZ6S'),
  ('bruce', '$2a$12$5QmWzkrtJaVnlsJh53BR8OZoHAUwDyWw6Z8gMCrCJbhQMGe/I8W2G'),
  ('test', '$2a$12$lHK6LVpc15/ZROZcKU00QeiD.RyYq5dVlV/9m4kKYbGibkRc5l4Ne');

INSERT INTO enjoycook_recipes (name, content, img_src, author_id, category_id)
VALUES
  ('Stew Chicken', 'Remove any skin from the chicken and wash it with water. Drain the water away and season with salt, browning sauce, garlic, green onion and rice wine. Fried the chicken for three minutes to make all sides golden. Add enough water about cover the chicken in the pot. Put the cover on the pot and cook for about 20 minutes', 'https://www.publicdomainpictures.net/pictures/370000/velka/chicken-and-vegetables-in-crock-pot.jpg', 1, 3),
  ( 'Pork Meat Ball Soup', 'Combine the cinnamon, cloves, salt and pepper with the pork in a bowl. In a large saucepan, brown the onion in the butter. Add the carrots and garlic and cook for 2 minutes. Add the broth and potatoes and bring to a boil. Shape each ball with about 15 ml (1 tablespoon) of the meat mixture and add to the simmering broth. Simmer gently, covered, for about 30 minutes or until the vegetables are tender. Add the parsley and adjust the seasoning.', 'https://upload.wikimedia.org/wikipedia/commons/b/be/Pork_Meat_Ball_Soup.jpg',2, null),
  ('Toast', 'Prepare the bread, toaster and butter. Put bread in toaster. Turn the toaster onto 2 to 3 minutes. Check out whether the bread is toasted. Butter the toasted bread.','https://www.publicdomainpictures.net/pictures/20000/velka/buttered-toast.jpg',3, 1),
  ( 'Salad', 'Basic salad ingredients include lettuce, tomatoes, cucumber, carrots, green onions, cheese, croutons, green pepper. Wash the ingredients and put them in a bowl. Serve with your favorite salad dressing (ranch, honey mustard etc.) and homemade croutons', 'https://www.needpix.com/file_download.php?url=https://storage.needpix.com/thumbs/salad-4116541_1280.jpg',2, 2);
        
INSERT INTO enjoycook_comments (content, recipe_id, user_id) 
VALUES
  ('I havent tried this yet, but it looks great. I am an experienced cook and can usually tell from from the ingredients if something is going to be good.', 1, 1),
  ('Hi! This soup sounds delicious. I usually make the meatballs with pork and beef 50/50.', 2, 2),
  ('Wow, never tried fried the chicken before stewing it... sounds great.', 1, 2),
  ('How to make a shape (like heart) on the bread ?', 3, 3),
  ('Add some silk noodles in the soup will make it more delicious!', 2, 1),
  ('Salad is always a good choice for better health.', 4, 1),
  ('Looks beautiful. I cant wait to make it immediately', 4, 2);
INSERT INTO enjoycook_recipes_collectors (rec_id, collector_id)
VALUES
  (1, 1),
  (2, 1),
  (4, 2),
  (3, 3);
COMMIT;

        
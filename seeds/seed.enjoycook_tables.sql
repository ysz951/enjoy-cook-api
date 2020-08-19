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
  ('Stew Chicken', 'Corporis accusamus placeat quas non voluptas. Harum fugit molestias qui. Velit ex animi reiciendis quasi. Suscipit totam delectus ut voluptas aut qui rerum. Non veniam eius molestiae rerum quam.\n \rUnde qui aperiam praesentium alias. Aut temporibus id quidem recusandae voluptatem ut eum. Consequatur asperiores et in quisquam corporis maxime dolorem soluta. Et officiis id est quia sunt qui iste reiciendis saepe. Ut aut doloribus minus non nisi vel corporis. Veritatis mollitia et molestias voluptas neque aspernatur reprehenderit.\n \rMaxime aut reprehenderit mollitia quia eos sit fugiat exercitationem. Minima dolore soluta. Quidem fuga ut sit voluptas nihil sunt aliquam dignissimos. Ex autem nemo quisquam voluptas consequuntur et necessitatibus minima velit. Consequatur quia quis tempora minima. Aut qui dolor et dignissimos ut repellat quas ad.', 'https://www.publicdomainpictures.net/pictures/370000/velka/chicken-and-vegetables-in-crock-pot.jpg', 1, 3),
  ( 'Pork Meat Ball Soup', 'Eos laudantium quia ab blanditiis temporibus necessitatibus. Culpa et voluptas ut sed commodi. Est qui ducimus id. Beatae sint aspernatur error ullam quae illum sint eum. Voluptas corrupti praesentium soluta cumque illo impedit vero omnis nisi.\n \rNam sunt reprehenderit soluta quis explicabo impedit id. Repudiandae eligendi libero ad ut dolores. Laborum nihil sint et labore iusto reiciendis cum. Repellat quos recusandae natus nobis ullam autem veniam id.\n \rEsse blanditiis neque tempore ex voluptate commodi nemo. Velit sapiente at placeat eveniet ut rem. Quidem harum ut dignissimos. Omnis pariatur quas aperiam. Quasi voluptas qui nulla. Iure quas veniam aut quia et.', 'https://upload.wikimedia.org/wikipedia/commons/b/be/Pork_Meat_Ball_Soup.jpg',2, null),
  ('Toast', 'Quidem harum ut dignissimos.','https://www.publicdomainpictures.net/pictures/20000/velka/buttered-toast.jpg',3, 1),
  ( 'Salad', 'Laborum nihil sint et labore iusto reiciendis cum. Repellat quos recusandae natus nobis ullam autem veniam id.\n \rEsse blanditiis neque tempore ex voluptate commodi nemo. Velit sapiente at placeat eveniet ut rem. Quidem harum ut dignissimos. Omnis pariatur quas aperiam. Quasi voluptas qui nulla. Iure quas veniam aut quia et.', 'https://www.needpix.com/file_download.php?url=https://storage.needpix.com/thumbs/salad-4116541_1280.jpg',2, 2);
        
INSERT INTO enjoycook_comments (content, recipe_id, user_id) 
VALUES
  ('Repudiandae eligendi libero ad ut dolores. Laborum nihil sint et labore iusto reiciendis cum. Repellat quos recusandae natus nobis ullam autem veniam id.\n \rEsse blanditiis neque tempore ex voluptate commodi nemo. Velit sapiente at placeat eveniet ut rem. Quidem harum ut dignissimos. Omnis pariatur quas aperiam. Quasi voluptas qui nulla. Iure quas veniam aut quia et.', 1, 1),
  ('Veritatis mollitia et molestias voluptas neque aspernatur reprehenderit.\n \rMaxime aut reprehenderit mollitia quia eos sit fugiat exercitationem. Minima dolore soluta. Quidem fuga ut sit voluptas nihil sunt aliquam dignissimos. Ex autem nemo quisquam voluptas consequuntur et necessitatibus minima velit. Consequatur quia quis tempora minima. Aut qui dolor et dignissimos ut repellat quas ad.', 2, 2),
  ('Ex autem nemo quisquam voluptas consequuntur et necessitatibus minima velit. Consequatur quia quis tempora minima. Aut qui dolor et dignissimos ut repellat quas ad.', 1, 2),
  ('eligendi libero  Laborum nihil sint et labore iusto reic ad ut dolores. Laborum nihil sint r et necessitatibus minima velit. Consequatur quia quis ', 3, 3),
  ('eligendi libero ad ut dolores. Laborum nihil sint', 3, 1),
 ('eligendi libero ad r et necessitatibus minima velit. Consequatur quia quis  ut dolores. Laborum nihil sint', 4, 1),
 ('eligendi   laudantium quia ab blanditiis temporibus necessit libero ad ut dolores. Laborum nihil sint', 4, 2);
INSERT INTO enjoycook_recipes_collectors (rec_id, collector_id)
VALUES
  (1, 1),
  (2, 1),
  (4, 2),
  (3, 3);
COMMIT;

        
CREATE TABLE enjoycook_recipes (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    name TEXT NOT NULL,
    content TEXT NOT NULL,
    date_created TIMESTAMP DEFAULT now() NOT NULL,
    step TEXT[][],
    img_src TEXT,
    category_id INTEGER
        REFERENCES enjoycook_categories(id) ON DELETE SET NULL,
    author_id INTEGER
        REFERENCES enjoycook_users(id) ON DELETE CASCADE NOT NULL
);

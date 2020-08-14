CREATE TABLE enjoycook_recipes_collectors (
    rec_id INTEGER
        REFERENCES enjoycook_recipes(id) ON DELETE CASCADE NOT NULL,
    collector_id INTEGER
        REFERENCES enjoycook_users(id) ON DELETE CASCADE NOT NULL
);
CREATE UNIQUE INDEX recipe_collector ON enjoycook_recipes_collectors(rec_id, collector_id);
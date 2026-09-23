UPDATE posts
SET featured = FALSE;

UPDATE posts
SET featured = TRUE
WHERE id IN (1, 3, 5);
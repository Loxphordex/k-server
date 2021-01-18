DROP TABLE IF EXISTS discover;
CREATE TABLE discover (
  "id" SERIAL PRIMARY KEY,
  "content" TEXT NOT NULL,
  "date" TEXT
);
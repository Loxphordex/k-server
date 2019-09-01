DROP TABLE IF EXISTS images;
CREATE TABLE images (
  "id" SERIAL PRIMARY KEY,
  "url" TEXT NOT NULL,
  "name" TEXT,
  "link" TEXT
);
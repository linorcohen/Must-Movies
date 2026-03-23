CREATE TABLE IF NOT EXISTS movies (
  id             VARCHAR(255) PRIMARY KEY,
  title          VARCHAR(255) NOT NULL,
  year           INTEGER NOT NULL,
  synopsis       TEXT NOT NULL DEFAULT '',
  genres         TEXT[] NOT NULL DEFAULT '{}',
  poster_url     TEXT NOT NULL DEFAULT '',
  wallpaper_url  TEXT NOT NULL DEFAULT '',
  trailer_id     VARCHAR(50) NOT NULL DEFAULT '',
  poster_data    BYTEA,
  poster_mime    VARCHAR(50) NOT NULL DEFAULT 'image/jpeg',
  wallpaper_data BYTEA,
  wallpaper_mime VARCHAR(50) NOT NULL DEFAULT 'image/jpeg'
);

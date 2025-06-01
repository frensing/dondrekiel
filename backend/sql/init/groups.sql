CREATE TABLE IF NOT EXISTS groups
(
    id
         INTEGER
        PRIMARY
            KEY
        AUTOINCREMENT,
    name text,
    locationDate
         TIMESTAMP,
    locationLatitude
         NUMERIC,
    locationLongitude
         NUMERIC
);
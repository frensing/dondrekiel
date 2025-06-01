CREATE TABLE IF NOT EXISTS groups
(
    id
        INTEGER
        PRIMARY
            KEY
        AUTOINCREMENT,
    locationDate
        TIMESTAMP,
    locationLatitude
        NUMERIC,
    locationLongitude
        NUMERIC
);
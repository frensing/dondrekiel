create table if not exists groups
(
    id           integer primary key autoincrement,
    name         text,
    locationDate timestamp,
    latitude     real,
    longitude    real
);
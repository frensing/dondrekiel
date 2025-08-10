create table if not exists teams
(
    id           integer primary key autoincrement,
    name         text,
    locationDate timestamp,
    latitude     real,
    longitude    real
);
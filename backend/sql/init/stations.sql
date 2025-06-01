create table if not exists stations
(
    id          integer primary key autoincrement,
    name        text,
    description text,
    latitude    real,
    longitude   real
)
import config from "../config";
import * as fs from "node:fs";
import dbConstuctor from "better-sqlite3";

const db = dbConstuctor(config.SQLITE_PATH);
db.pragma("journal_mode = WAL");

export function initDb() {
  const groupsTableSql = fs.readFileSync("./sql/groups/init.sql", "utf8");
  db.prepare(groupsTableSql).run();

  const stationsTableSql = fs.readFileSync("./sql/stations/init.sql", "utf8");
  db.prepare(stationsTableSql).run();

  return db;
}

export default db;

import * as sqlite3 from "sqlite3";
import config from "../config";
import { Database, open } from "sqlite";
import * as fs from "node:fs";

export async function getDb() {
  return await open({
    filename: config.SQLITE_PATH,
    driver: sqlite3.Database,
  });
}

export async function initDb(db: Database) {
  const groupsTableSql = fs.readFileSync("./sql/groups/init.sql", "utf8");
  await db.run(groupsTableSql);

  const stationsTableSql = fs.readFileSync("./sql/stations/init.sql", "utf8");
  await db.run(stationsTableSql);

  return db;
}

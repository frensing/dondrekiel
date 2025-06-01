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
  const groupTableCreateSql = fs.readFileSync("./sql/init/groups.sql", "utf8");
  await db.run(groupTableCreateSql);

  return db;
}

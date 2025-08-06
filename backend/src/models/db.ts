import config from "../config";
import * as fs from "node:fs";
import * as sqlite from "node:sqlite";


const db = new sqlite.DatabaseSync(config.SQLITE_PATH);

export function initDb() {
  const groupsTableSql = fs.readFileSync("./sql/groups/init.sql", "utf8");
  db.prepare(groupsTableSql).run();

  const stationsTableSql = fs.readFileSync("./sql/stations/init.sql", "utf8");
  db.prepare(stationsTableSql).run();

  return db;
}

export default db;

import * as fs from "node:fs";
import { Database } from "sqlite";

export interface Group {
  id: number;
  name: string;
  locationDate: Date;
  latitude: number;
  longitude: number;
}

export async function addGroup(db: Database, name: string) {
  const insertSql = fs.readFileSync("./sql/groups/insert.sql", "utf8");

  const stmt = await db.prepare(insertSql, [name]);
  const result = await stmt.run();

  return result.lastID;
}
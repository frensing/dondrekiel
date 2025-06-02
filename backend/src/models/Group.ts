import * as fs from "node:fs";
import db from "./db";

export interface Group {
  id: number;
  name: string;
  locationDate: Date;
  latitude: number;
  longitude: number;
}

export function addGroup(name: string) {
  const insertSql = fs.readFileSync("./sql/groups/insert.sql", "utf8");

  const result = db.prepare(insertSql).run(name);

  return result.lastInsertRowid;
}

export function getAllGroups() {
  const sql = fs.readFileSync("./sql/groups/getAll.sql", "utf8");
  return db.prepare(sql).all() as Group[];
}
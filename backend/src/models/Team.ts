import * as fs from "node:fs";
import db from "./db";

export interface Team {
    id: number;
    name: string;
    locationDate: number | null;
    latitude: number | null;
    longitude: number | null;
}

export function addTeam(name: string) {
  const insertSql = fs.readFileSync("./sql/teams/insert.sql", "utf8");

  const result = db.prepare(insertSql).run(name);

  return result.lastInsertRowid;
}

export function getAllTeams() {
  const sql = fs.readFileSync("./sql/teams/getAll.sql", "utf8");
  return db.prepare(sql).all() as unknown as Team[];
}
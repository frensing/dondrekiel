import * as fs from "node:fs";
import db from "./db";

export interface Station {
  id: number;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
}

export function addStation(name: string, description: string, latitude: number, longitude: number) {
  const insertSql = fs.readFileSync("./sql/stations/insert.sql", "utf8");
  const result = db.prepare(insertSql).run(name, description, latitude, longitude);
  return result.lastInsertRowid;
}

export function getAllStations() {
  const sql = fs.readFileSync("./sql/stations/getAll.sql", "utf8");
  return db.prepare(sql).all() as Station[];
}
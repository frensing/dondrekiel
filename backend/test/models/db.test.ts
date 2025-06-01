import { beforeEach, describe, expect, test } from "@jest/globals";

import db, { initDb } from "../../src/models/db";

describe("Database Connection", () => {
  beforeEach(() => {
    db.exec("drop table if exists groups");
    db.exec("drop table if exists stations");
  });

  test("should init db if no tables exist", () => {
    const resultBefore = db.prepare("select name from sqlite_master where name is not 'sqlite_sequence'").all();
    expect(resultBefore).toEqual([]);

    initDb();

    const result = db.prepare("select name from sqlite_master where name is not 'sqlite_sequence'").all();

    expect(result).toEqual([
      { name: "groups" },
      { name: "stations" }
    ]);
  });
});
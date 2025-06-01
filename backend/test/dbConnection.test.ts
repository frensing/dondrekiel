import { beforeEach, describe, expect, test } from "@jest/globals";

import { getDb, initDb } from "../src/models/db";

describe("Database Connection", () => {
  beforeEach(async () => {
    const db = await getDb();

    await db.run("drop table if exists groups");
    await db.run("drop table if exists stations");
    await db.close();
  });

  test("should init db if no tables exist", async () => {
    const db = await getDb();
    const resultBefore = await db.get("select count(*) as tableCount from sqlite_master where name is not 'sqlite_sequence'");
    expect(resultBefore.tableCount).toBe(0);

    await initDb(db);

    const result = await db.all("select name from sqlite_master where name is not 'sqlite_sequence'");

    expect(result).toEqual([
      { name: "groups" },
      { name: "stations" }
    ]);

    await db.close();
  });
});
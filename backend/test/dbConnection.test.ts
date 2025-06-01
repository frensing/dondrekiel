import { beforeEach, describe, expect, test } from "@jest/globals";

import { getDb, initDb } from "../src/models/db";

describe("Database Connection", () => {
  beforeEach(async () => {
    const db = await getDb();

    await db.run("drop table if exists groups");
    db.close();
  });

  test("should init db if no tables exist", async () => {
    const db = await getDb();
    const resultBefore = await db.get("select count(*) as tableCount from sqlite_master");
    expect(resultBefore.tableCount).toBe(1);

    await initDb(db);

    const result = await db.get("select count(*) as tableCount from sqlite_master");
    expect(result.tableCount).toBe(2);

    await db.close();
  });
});
import { beforeAll, describe, expect, test } from "@jest/globals";
import { getDb, initDb } from "../../src/models/db";
import { addGroup } from "../../src/models/groups";

describe("groups model", () => {
  beforeAll(() => {
    // fs.rmSync("db.test.sqlite");
  });

  test("should add a group to the db", async () => {
    const db = await getDb();
    await initDb(db);

    const id = await addGroup(db, "TestGroup");

    const result = await db.all("select * from groups where id = ?", id);
    expect(result).toEqual([{
      id,
      name: "TestGroup",
      locationDate: null,
      latitude: null,
      longitude: null,
    }]);
  });
});
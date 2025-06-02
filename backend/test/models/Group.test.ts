import { beforeEach, describe, expect, test } from "@jest/globals";
import db, { initDb } from "../../src/models/db";
import { addGroup, getAllGroups } from "../../src/models/Group";

describe("groups model", () => {
  beforeEach(() => {
    db.prepare("drop table if exists groups").run();
    initDb();
  });

  test("should add a group to the db", () => {
    const id = addGroup("TestGroup");

    const result = db.prepare("select * from groups where id = ?").get(id);
    expect(result).toEqual({
      id,
      name: "TestGroup",
      locationDate: null,
      latitude: null,
      longitude: null,
    });
  });

  test("should return all groups", () => {
    const id1 = addGroup("Group 1");
    const id2 = addGroup("Group 2");

    const result = getAllGroups();
    expect(result).toEqual([
      {
        id: id1,
        name: "Group 1",
        locationDate: null,
        latitude: null,
        longitude: null,
      },
      {
        id: id2,
        name: "Group 2",
        locationDate: null,
        latitude: null,
        longitude: null,
      }
    ]);
  });
});
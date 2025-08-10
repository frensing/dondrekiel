import { beforeEach, describe, expect, test } from "@jest/globals";
import db, { initDb } from "../../src/models/db";
import { addTeam, getAllTeams } from "../../src/models/Team";

describe("teams model", () => {
  beforeEach(() => {
    db.prepare("drop table if exists teams").run();
    initDb();
  });

  test("should add a group to the db", () => {
    const id = addTeam("TestTeam");

    const result = db.prepare("select * from teams where id = ?").get(id);
    expect(result).toEqual({
      id,
      name: "TestTeam",
      locationDate: null,
      latitude: null,
      longitude: null,
    });
  });

  test("should return all teams", () => {
    const id1 = addTeam("Team 1");
    const id2 = addTeam("Team 2");

    const result = getAllTeams();
    expect(result).toEqual([
      {
        id: id1,
        name: "Team 1",
        locationDate: null,
        latitude: null,
        longitude: null,
      },
      {
        id: id2,
        name: "Team 2",
        locationDate: null,
        latitude: null,
        longitude: null,
      }
    ]);
  });
});
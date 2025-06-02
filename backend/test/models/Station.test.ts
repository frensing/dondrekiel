import { beforeEach, describe, expect, test } from "@jest/globals";
import db, { initDb } from "../../src/models/db";
import { addStation, getAllStations } from "../../src/models/Station";

describe("Station model", () => {
  beforeEach(() => {
    db.prepare("drop table if exists stations").run();
    initDb();
  });

  test("should add a station to the db", () => {
    const id = addStation("Station 1", "Description", 51.4, 7.8);

    const result = db.prepare("select * from stations where id = ?").get(id);
    expect(result).toEqual({
      id,
      name: "Station 1",
      description: "Description",
      latitude: 51.4,
      longitude: 7.8,
    });
  });

  test("should return all stations", () => {
    const id1 = addStation("Station 1", "Description", 51.4, 7.8);
    const id2 = addStation("Station 2", "Description 2", 51.4, 7.8);

    const result = getAllStations();
    expect(result).toEqual([
      {
        id: id1,
        name: "Station 1",
        description: "Description",
        latitude: 51.4,
        longitude: 7.8,
      },
      {
        id: id2,
        name: "Station 2",
        description: "Description 2",
        latitude: 51.4,
        longitude: 7.8,
      }
    ]);
  });
});
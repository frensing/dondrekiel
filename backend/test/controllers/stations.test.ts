import supertest from "supertest";
import { describe, expect, test } from "@jest/globals";
import app from "../../src/app";

const api = supertest(app);

describe("stations endpoint", () => {
  const stations = [{
    id: 1,
    name: "Station 1",
    description: "Beschreibung",
  }];

  test("should retur a list of all stations", async () => {
    const result = await api.get("/api/v1/stations")
      .expect(200)
      .expect("Content-Type", /json/);

    expect(result.body).toEqual(stations);
  });
});
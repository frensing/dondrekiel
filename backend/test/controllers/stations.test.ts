import supertest from "supertest";
import { describe, expect, jest, test } from "@jest/globals";
import app from "../../src/app";

const api = supertest(app);

const stations = [{
  id: 1,
  name: "Station 1",
  description: "Beschreibung",
}];

jest.mock("../../src/models/Station", () => {
  const originalModule = jest.requireActual("../../src/models/Station") as object;
  return {
    __esModule: true,
    ...originalModule,
    getAllStations: jest.fn(() => stations),
  };
});

describe("stations endpoint", () => {
  test("should retur a list of all stations", async () => {
    const result = await api.get("/api/v1/stations")
      .expect(200)
      .expect("Content-Type", /json/);

    expect(result.body).toEqual(stations);
  });
});
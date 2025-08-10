import supertest from "supertest";
import { describe, expect, jest, test } from "@jest/globals";
import app from "../../src/app";

const api = supertest(app);

const users = [{
  id: 1,
  name: "Team 1",
}];

jest.mock("../../src/models/Team", () => {
  const originalModule = jest.requireActual("../../src/models/Team") as object;
  return {
    __esModule: true,
    ...originalModule,
    getAllTeams: jest.fn(() => users),
  };
});

describe("teams endpoint", () => {
  test("should return a list of teams", async () => {
    const result = await api.get("/api/v1/teams")
      .expect(200)
      .expect("Content-Type", /json/);

    expect(result.body).toEqual(users);
  });
});
import supertest from "supertest";
import { describe, expect, jest, test } from "@jest/globals";
import app from "../../src/app";

const api = supertest(app);

describe("groups endpoint", () => {
  const users = [{
    id: 1,
    name: "Gruppe 1",
  }];

  jest.mock("../../src/models/Group", () => {
    const originalModule = jest.requireActual("../../src/models/Group") as object;
    return {
      __esModule: true,
      ...originalModule,
      getAllGroups: jest.fn(() => users),
    };
  });

  test("should return a list of groups", async () => {
    const result = await api.get("/api/v1/groups")
      .expect(200)
      .expect("Content-Type", /json/);

    expect(result.body).toEqual(users);
  });
});
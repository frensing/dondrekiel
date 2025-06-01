import supertest from "supertest";

import app from "../../src/app";
import { describe, expect, jest, test } from "@jest/globals";

const api = supertest(app);

jest.mock("../../src/models/groups");


describe("groups endpoint", () => {
  test("should return a list of groups", async () => {
    const result = await api.get("/api/v1/groups")
      .expect(200)
      .expect("Content-Type", /json/);

    expect(result.body).toEqual([{
      id: 1,
      name: "Gruppe 1",
    }]);
  });
});
import supertest from "supertest";

import app from "../../src/app";
import { describe, expect, test } from "@jest/globals";

const api = supertest(app);

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
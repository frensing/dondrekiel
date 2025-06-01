import supertest from "supertest";

import app from "../src/app";
import { describe, expect, test } from "@jest/globals";

const api = supertest(app);

describe("unknown endpoint", () => {
  test("should return message if endpoint unknown", async () => {
    const response = await api.get("/unknown")
      .expect(404)
      .expect("Content-Type", /json/);

    expect(response.body).toEqual({
      error: "unknown endpoint",
    });
  });
});
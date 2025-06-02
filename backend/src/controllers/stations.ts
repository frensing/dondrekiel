import express from "express";
import { getAllStations } from "../models/Station";

const stationsRouter = express.Router();

stationsRouter.get("/", async (_req, res) => {
  const stations = getAllStations();
  res.json(stations);
});

export default stationsRouter;
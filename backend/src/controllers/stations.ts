import express from "express";

const stationsRouter = express.Router();

stationsRouter.get("/", async (_req, res) => {
  const stations = [{
    id: 1,
    name: "Station 1",
    description: "Beschreibung",
  }];

  res.json(stations);
});

export default stationsRouter;
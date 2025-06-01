import express from "express";

const groupsRouter = express.Router();

groupsRouter.get("/", async (_req, res) => {
  const groups = [{
    id: 1,
    name: "Gruppe 1",
  }];

  res.json(groups);
});

export default groupsRouter;
import express from "express";
import { getAllTeams } from "../models/Team";

const groupsRouter = express.Router();

groupsRouter.get("/", async (_req, res) => {
  const groups = getAllTeams();

  res.json(groups);
});

export default groupsRouter;
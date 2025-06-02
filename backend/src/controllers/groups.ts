import express from "express";
import { getAllGroups } from "../models/Group";

const groupsRouter = express.Router();

groupsRouter.get("/", async (_req, res) => {
  const groups = getAllGroups();

  res.json(groups);
});

export default groupsRouter;
import { RequestHandler } from "express";

const unkownEndpoint: RequestHandler = (_req, res) => {
  res.status(404).send({ error: "unknown endpoint" });
};

export default { unkownEndpoint };
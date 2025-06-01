import express from "express";
import morgan from "morgan";
import middleware from "./utils/middleware";
import groupsRouter from "./controllers/groups";

const app = express();

app.use(express.json());
app.use(morgan("dev"));

app.use("/api/v1/groups", groupsRouter);

app.use(middleware.unkownEndpoint);

export default app;
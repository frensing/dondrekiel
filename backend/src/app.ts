import express from "express";
import morgan from "morgan";
import middleware from "./utils/middleware";

const app = express();

app.use(express.json());
app.use(morgan("dev"));

app.use(middleware.unkownEndpoint);

export default app;
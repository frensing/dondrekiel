import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 3001;
const SQLITE_PATH = process.env.SQLITE_PATH || "./db.sql";

export default {
  PORT,
  SQLITE_PATH,
};
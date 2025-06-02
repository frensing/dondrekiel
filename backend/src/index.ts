import config from "./config";
import app from "./app";
import { initDb } from "./models/db";

initDb();

app.listen(config.PORT, () => {
  console.log(`Server started on port ${config.PORT}`);
});
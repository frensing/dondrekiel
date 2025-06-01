import config from "./config";
import app from "./app";

app.listen(config.PORT, () => {
  console.log(`Server started on port ${config.PORT}`);
});
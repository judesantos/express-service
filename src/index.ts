import "./LoadEnv"; // Must be the first import
import env from "../env";

import app from "@server";
import logger from "@shared/Logger";

// Start the server
const port = Number(env.serverPort || 3000);
app.listen(port, () => {
  logger.info("Express server started! Listening on port: " + port);
});

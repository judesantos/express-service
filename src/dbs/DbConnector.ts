import mongoose from "mongoose";
import logger from "../shared/Logger";

class DbConnector {
  private cnx: any;

  public async connect(
    url: string,
    name: string,
    isProduction: boolean = false
  ) {
    // supports multiple db instance
    this.cnx = await mongoose.createConnection(url, {
      useCreateIndex: true,
      useUnifiedTopology: true,
      useNewUrlParser: true,
      connectTimeoutMS: 10000,
      keepAlive: true,
      dbName: name,
    });

    if (!isProduction) {
      this.cnx.set("debug", true);
    }

    this.cnx.on("connected", () => {
      logger.info("Mongoose default connection open to " + url);
    });

    // If the connection throws an error
    this.cnx.on("error", (err: any) => {
      logger.error("Mongoose default connection error: " + err);
    });

    // When the connection is disconnected
    this.cnx.on("disconnected", () => {
      logger.info("Mongoose default connection disconnected");
    });

    // If the Node process ends, close the Mongoose connection
    process.on("SIGINT", () => {
      this.cnx.close(() => {
        logger.warn(
          "Mongoose default connection disconnected through app termination"
        );
        this.cnx = null;
        process.exit(0);
      });
    });

    return this.cnx;
  }

  public isConnected() {
    return !this.cnx;
  }

  public connection() {
    return this.cnx;
  }
}

export default DbConnector;

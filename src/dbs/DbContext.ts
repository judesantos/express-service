const debug = require("debug")("taskpal-service:context");
import logger from "@shared/Logger";

import DbConnector from "./DbConnector";
import env from "../../env";

/**
 * DbContext singleton
 */
class DbContext {
  private static instance: DbContext;
  private constructor() {}

  private dbs: any = [];
  private db: DbConnector = new DbConnector();

  public static getInstance(): DbContext {
    if (!DbContext.instance) {
      DbContext.instance = new DbContext();
    }
    return DbContext.instance;
  }

  public useDb(name: string) {
    return this.dbs[name];
  }

  public async addDb(name: string, opts: any) {
    return this.db
      .connect(opts.url, name, env.isProduction === "true" ? true : false)
      .then((cnx) => {
        // add db to our local cache
        this.dbs[name] = cnx;
        return true;
      })
      .catch((err) => {
        logger.error("DbContext::addDb Exception: " + err);
        return false;
      });
  }
  /**
   * fetch from config - load and connect to each db defined in config
   *
   * Ex. Config:
   *  mongodb: {
   *    db1: {
   *      url: 'mongodb://db1',
   *    },
   *    db2: {
   *      url: 'mongodb://db2' ,
   *    }
   *  }
   **/
  public async init() {
    const configs: any = env.mongoDb;
    for (const name in configs) {
      await this.addDb(name, configs[name]);
    }
    return true;
  }
}

export default DbContext;

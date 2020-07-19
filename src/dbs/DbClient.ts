import DbContext from "./DbContext";
import ISchema from "src/models/Schema";
const sleep = require("sleep");

class DbClient {
  private dbConn: any;

  /**
   * Get Db connection instance
   * @param dbName
   */
  constructor(dbName: string) {
    this.dbConn = DbContext.getInstance().useDb(dbName);
  }

  /**
   * getModel from schrma definition. Create if not exists.
   *
   * @param modelName
   * @param collectionName
   * @param schema
   * @return Model(modelName) instance
   */
  public getModel(modelName: string, collectionName: string, schema: any) {
    if (!this.dbConn) {
      this.dbConn = DbContext.getInstance().useDb("taskpal");
      if (!this.dbConn) throw "DbClient exception: No connection to Db.";
    }
    // create or get schema
    // const newSchema = new this.dbConn.Schema(
    //   schema.definitions,
    //   schema.options
    // );
    // // add custome hooks
    // for (const [key, val] of Object.entries(schema.methods)) {
    //   if (typeof val === "function") {
    //     newSchema.methods[key] = val;
    //   }
    // }
    // create Model instance
    const model = this.dbConn.model(
      modelName.toLowerCase().charAt(0).toUpperCase(),
      schema,
      collectionName.toLowerCase()
    );
    // return Model
    return model;
  }
}

export default DbClient;

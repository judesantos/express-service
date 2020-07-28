import dotenv from "dotenv";
import commandLineArgs from "command-line-args";

const path = require("path");

// Setup command line options
const options = commandLineArgs([
  {
    name: "env",
    alias: "e",
    defaultValue: "development",
    type: String,
  },
]);

dotenv.config();
// Set the env file

const result2 = dotenv.config({
  path: path.resolve(__dirname, `../.env/${options.env}.env`),
});

if (result2.error) {
  throw result2.error;
}

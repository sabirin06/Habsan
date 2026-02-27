import mongoose from "mongoose";
mongoose.Promise = global.Promise;
import { fileURLToPath } from "url";
import path from "path";
import dotenv from "dotenv";

// Convert `import.meta.url` to a file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load the .env file
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
export default function () {
  const url =
    process.env.NODE_ENV === "production"
      ? process.env.PROD_DB_URL
      : process.env.DEV_DB_URL;

  console.log("process.env.DEV_DB_URL: ====>", process.env.DEV_DB_URL);

  const db = mongoose
    .connect(url, {
      // useUnifiedTopology: true, useNewUrlParser: true,
    })
    .then(() => {
      console.log("DB connection successful");
    })
    .catch((err) => {
      console.log("DB connection error:", err);
    });

  return db;
}

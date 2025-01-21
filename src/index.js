import connectDB from "./db/connectDB.js";
import dotenv from "dotenv";
import { app } from "./app.js";

dotenv.config({
  path: "./env",
});

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`⚙️ Server is running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => [console.log("MONGO_DB Connection Failed", err)]);

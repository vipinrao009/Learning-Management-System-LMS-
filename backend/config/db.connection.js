import mongoose from "mongoose";
import { config } from "dotenv";
config();

mongoose.set("strictQuery", false);//strictQuery => if i sent unrelevent data to db then don't throw error

const connectToDB = async () => {
  try {
    console.log(process.env.MONGO_URI);
    const { connection } = await mongoose.connect(process.env.MONGO_URI);

    if (connection) {
      console.log(`DB is connected ${connection.host}`);
    }
  } catch (e) {
    console.log(e);
    process.exit(1);
  }
};

export default connectToDB;
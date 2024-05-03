import { connect } from "mongoose";

const connectDB = async () => {
  try {
    const conn = await connect(process.env.DB_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connection to mongoDB: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;

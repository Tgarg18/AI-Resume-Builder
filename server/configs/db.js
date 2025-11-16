import mongoose from "mongoose";

const connectDB = async () => {
  try {
    // Mongoose connection keyword -> connected, disconnected, error
    mongoose.connection.on("connected", () => {
      console.log("Database Connected");
    });

    let mongodbURI = process.env.MONGODB_URI;
    const projectName = "resume-builder";
    if (!mongodbURI) {
      throw new Error("MONGODB_URI enviorment variable not set");
    }
    if (mongodbURI.endsWith("/")) {
      mongodbURI = mongodbURI.slice(0, -1);
    }
    await mongoose.connect(`${mongodbURI}/${projectName}`);
    // console.log("Conncected to DB");
  } catch (error) {
    console.log("Error Connceting to MongoDB: \n", error);
  }
};

export default connectDB;

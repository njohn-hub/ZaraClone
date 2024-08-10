import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import UserRouter from "./Routes/User.js";
import ProductRouter from "./Routes/Products.js";

const app = express();
dotenv.config();
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));

// error handle
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "Something went wrong";
  return res.status(status).json({
    success: false,
    status,
    message,
  });
});

app.get("/", async (req, res) => {
  res.status(200).json({
    message: "Hello now",
  });
});


const connectDB = () => {
  mongoose.set("strictQuery", true);
  mongoose
    .connect(process.env.MONGODB_PASS)
    .then(() => console.log("database connection successfull"))
    .catch((error) => {
      console.error("Failed to connect");
      console.error(error);
    });
};

app.use("/api/user/", UserRouter);
app.use("/api/products/", ProductRouter);

const startServer = async () => {
  try {
    connectDB();
    app.listen(8000, () => console.log("server running"));
  } catch (error) {
    console.log(error);
  }
};

startServer();

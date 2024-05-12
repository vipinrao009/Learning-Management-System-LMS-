const app = express();
// import { config } from "dotenv";
// config();
import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";
import morgan from "morgan";

import connectToDB from "./config/db.connection.js";
import user from "./routers/userRouters.js";
import course from "./routers/courseRouter.js";
import payment from "./routers/paymentRouters.js"
import miscellaneous from "./routers/miscellaneous.route.js"
import errorMiddleware from "./middleware/error.middleware.js";


app.use(express.json());
app.use(cookieParser());

app.use(express.urlencoded({extended:true}));
app.use(
  cors({
    origin: [process.env.FRONTEND_URL],
    credentials: true
  })
);

app.use(morgan("dev")); // by this we will know on console what is the user trying to access

// DB connection
connectToDB();


app.use("/api/v1/user",user);
app.use("/api/v1/course",course)
app.use("/api/v1/payment",payment)
app.use("/api/v1",miscellaneous)
// 3 module are yet to write

app.use("/",(req,res)=>{
  res.send("Hello world")
})
app.all("*", (req, res) => {
  res.status(404).send("OOPS!! 404 PAGE NOT FOUND");
});

// controller se error  userRoutes par aayega and then userRoutes se errorMiddleware ke pass ayega
app.use(errorMiddleware);

export default app;
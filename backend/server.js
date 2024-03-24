import express from "express";
import dotenv from "dotenv";
import connectToDB from "./db/connectToDb.js";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/user.routes.js";
import postRoutes from "./routes/post.routes.js";



dotenv.config();
connectToDB();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/users", userRoutes)
app.use("/api/posts", postRoutes)

app.listen(PORT, () => {
    console.log(`server running on port  ${PORT}`);
})
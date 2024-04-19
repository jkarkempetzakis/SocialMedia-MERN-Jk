import express from "express";
import dotenv from "dotenv";
import connectToDB from "./db/connectToDb.js";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/user.routes.js";
import postRoutes from "./routes/post.routes.js";
import messageRoutes from "./routes/message.routes.js";
import { v2 as cloudinary } from "cloudinary";
import { app, server } from "./socket/socket.js";



dotenv.config();
connectToDB();
// const app = express();
const PORT = process.env.PORT || 5000;


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.use(express.json({ limit: '500kb' }));
app.use(express.urlencoded({ extended: true, limit: '500kb' }));
app.use(cookieParser());

app.use("/api/users", userRoutes)
app.use("/api/posts", postRoutes)
app.use("/api/messages", messageRoutes);

server.listen(PORT, () => {
    console.log(`server running on port  ${PORT}`);
})
import dotenv from "dotenv";
dotenv.config();
import { Server } from "socket.io";
import express from "express";
const app = express();
import userRoutes from "./src/routes/user.routes.js";
import mongoose from "mongoose";
import Document from "./src/models/document.models.js";
import http from "http";
import cors from "cors";
import User from "./src/models/user.models.js";

mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
app.use(
  cors({
    origin: ["http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    exposedHeaders: ["set-cookie"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use("/api/user", userRoutes);

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("Connected to MongoDB");
});

const io = new Server(3001, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});
const defaultValue = "";
io.on("connection", (socket) => {
  socket.on("get-document", async (documentId, userId) => {
    const user = await User.findById(userId);
    if (!user) return;

    const document = await findOrCreateDocument(documentId);
    if (!user.documents.includes(documentId)) {
      user.documents.push(documentId);

      await user.save();
    }

    socket.join(documentId);
    socket.emit("load-document", document);
    socket.on("send-changes", (delta) => {
      socket.broadcast.to(documentId).emit("receive-changes", delta);
    });
    socket.on("save-document", async (data, title) => {
      await Document.findByIdAndUpdate(
        documentId,
        {
          data: data,
          title: title,
          $addToSet: { users: userId },
        },
        { new: true }
      );
    });
  });
});

async function findOrCreateDocument(id) {
  if (id == null) return;
  const document = await Document.findById(id);
  if (document) return document;
  return await Document.create({ _id: id, data: defaultValue });
}

app.listen(8000, () => {
  console.log("Server is running on port 8000");
});

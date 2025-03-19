// import dotenv from "dotenv";
// dotenv.config();
// import { Server } from "socket.io";
// import express from "express";
// const app = express();
// import userRoutes from "./src/routes/user.routes.js";
// import mongoose from "mongoose";
// import Document from "./src/models/document.models.js";
// import http from "http";
// import cors from "cors";
// import User from "./src/models/user.models.js";

// mongoose.connect(process.env.MONGODB_URL, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });
// const BASE_URL = process.env.BASE_URL;
// const db = mongoose.connection;
// app.use(
//   cors({
//     origin: [`${BASE_URL}`],
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     exposedHeaders: ["set-cookie"],
//   })
// );
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(express.static("public"));
// app.use("/api/user", userRoutes);

// db.on("error", console.error.bind(console, "connection error:"));
// db.once("open", function () {
//   console.log("Connected to MongoDB");
// });

// const io = new Server(3001, {
//   cors: {
//     origin: `${BASE_URL}`,
//     methods: ["GET", "POST"],
//   },
// });
// const defaultValue = "";
// io.on("connection", (socket) => {
//   socket.on("get-document", async (documentId, userId) => {
//     const user = await User.findById(userId);
//     if (!user) return;

//     const document = await findOrCreateDocument(documentId);
//     if (!user.documents.includes(documentId)) {
//       user.documents.push(documentId);

//       await user.save();
//     }

//     socket.join(documentId);
//     socket.emit("load-document", document);
//     socket.on("send-changes", (delta) => {
//       socket.broadcast.to(documentId).emit("receive-changes", delta);
//     });
//     socket.on("save-document", async (data, title) => {
//       await Document.findByIdAndUpdate(
//         documentId,
//         {
//           data: data,
//           title: title,
//           $addToSet: { users: userId },
//         },
//         { new: true }
//       );
//     });
//   });
// });

// async function findOrCreateDocument(id) {
//   if (id == null) return;
//   const document = await Document.findById(id);
//   if (document) return document;
//   return await Document.create({ _id: id, data: defaultValue });
// }
import dotenv from "dotenv";
dotenv.config();
import { Server } from "socket.io";
import express from "express";
import mongoose from "mongoose";
import http from "http";
import cors from "cors";

import userRoutes from "./src/routes/user.routes.js";
import Document from "./src/models/document.models.js";
import User from "./src/models/user.models.js";

const app = express();
const server = http.createServer(app);

const BASE_URL = process.env.BASE_URL || "https://groundzero-snowy.vercel.app";
console.log("Allowed Origin:", BASE_URL);

mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

// CORS Middleware
app.use(
  cors({
    origin: BASE_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["set-cookie"],
  })
);
app.options("*", cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use("/api/user", userRoutes);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: BASE_URL,
    methods: ["GET", "POST"],
    credentials: true,
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
  if (!id) return null;
  const document = await Document.findById(id);
  return document || await Document.create({ _id: id, data: defaultValue });
}

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


// app.listen(8000, () => {
//   console.log("Server is running on port 8000");
// });

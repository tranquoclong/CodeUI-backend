const express = require("express");
const app = express();
const fs = require("fs");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const swaggerUi = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerSpec = require("./docs");
const bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
const expressValidator = require("express-validator");
const socket = require("socket.io");
dotenv.config();
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("db connected"));
mongoose.connection.on("error", (err) => {
  console.log(`db connection error: ${err.message}`);
});
const postRoutes = require("./routes/post");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const accountRoutes = require("./routes/account");
const adminRoutes = require("./routes/admin");
const toolRoutes = require("./routes/tool");
const messageRoutes = require("./routes/messages");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Library API",
      version: "1.0.0",
      description: "A simple Express Library API",
    },
    schemes: ["http", "https"],
    servers: [
      {
        url: "http://localhost:5000/api",
      },
    ],
  },
  apis: ["./docs/*.js"],
};

const specs = swaggerJsDoc(options);

app.get("/api", (req, res) => {
  fs.readFile("docs/apiDocs.json", (err, data) => {
    if (err) {
      res.status(400).json({
        error: err,
      });
    }
    const docs = JSON.parse(data);
    res.json(docs);
  });
});
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(expressValidator());
const corsOptions = {
  origin: "https://codeui.vercel.app",
  // origin: [
  //   "https://codeui.vercel.app",
  //   "http://127.0.0.1:5173",
  //   "http://127.0.0.1:5174",
  //   "https://codeui-exe201.vercel.app",
  //   "https://codeui-admin.vercel.app",
  // ],
  credentials: true,
  // optionSuccessStatus: 200,
};
app.use(cors(corsOptions));
// app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
// app.use(cors());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api", postRoutes);
app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api", accountRoutes);
app.use("/api", adminRoutes);
app.use("/api", toolRoutes);
app.use("/api", messageRoutes);
app.use(function (err, req, res, next) {
  if (err.name === "UnauthorizedError") {
    res.status(401).json({ error: "Unauthorized!" });
  }
});
const port = process.env.PORT || 5000;
const server = app.listen(port, () => {
  console.log(`a node js api listenting on port ${port}`);
});

const io = socket(server, {
  cors: {
    origin: "https://codeui.vercel.app",
    methods: ["GET", "POST"],
    credentials: true,
  },
});
connections = {};
messages = {};
timeOnline = {};
global.onlineUsers = new Map();
io.on("connection", (socket) => {
  global.chatSocket = socket;
  socket.on("add-user", (userId) => {
    onlineUsers.set(userId, socket.id);
  });

  socket.on("send-msg", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("msg-recieve", data.msg);
    }
  });
  socket.on("join-call", (path) => {
    if (connections[path] === undefined) {
      connections[path] = [];
    }
    connections[path].push(socket.id);

    timeOnline[socket.id] = new Date();

    for (let a = 0; a < connections[path].length; ++a) {
      io.to(connections[path][a]).emit(
        "user-joined",
        socket.id,
        connections[path]
      );
    }

    if (messages[path] !== undefined) {
      for (let a = 0; a < messages[path].length; ++a) {
        io.to(socket.id).emit(
          "chat-message",
          messages[path][a]["data"],
          messages[path][a]["sender"],
          messages[path][a]["socket-id-sender"]
        );
      }
    }
    console.log(path, connections[path]);
  });
  	socket.on("signal", (toId, message) => {
      io.to(toId).emit("signal", socket.id, message);
    });

    socket.on("chat-message", (data, sender) => {
      data = sanitizeString(data);
      sender = sanitizeString(sender);

      var key;
      var ok = false;
      for (const [k, v] of Object.entries(connections)) {
        for (let a = 0; a < v.length; ++a) {
          if (v[a] === socket.id) {
            key = k;
            ok = true;
          }
        }
      }

      if (ok === true) {
        if (messages[key] === undefined) {
          messages[key] = [];
        }
        messages[key].push({
          sender: sender,
          data: data,
          "socket-id-sender": socket.id,
        });
        console.log("message", key, ":", sender, data);

        for (let a = 0; a < connections[key].length; ++a) {
          io.to(connections[key][a]).emit(
            "chat-message",
            data,
            sender,
            socket.id
          );
        }
      }
    });

  socket.on("disconnect", () => {
    var diffTime = Math.abs(timeOnline[socket.id] - new Date());
    var key;
    for (const [k, v] of JSON.parse(
      JSON.stringify(Object.entries(connections))
    )) {
      for (let a = 0; a < v.length; ++a) {
        if (v[a] === socket.id) {
          key = k;

          for (let a = 0; a < connections[key].length; ++a) {
            io.to(connections[key][a]).emit("user-left", socket.id);
          }

          var index = connections[key].indexOf(socket.id);
          connections[key].splice(index, 1);

          console.log(key, socket.id, Math.ceil(diffTime / 1000));

          if (connections[key].length === 0) {
            delete connections[key];
          }
        }
      }
    }
  });
});

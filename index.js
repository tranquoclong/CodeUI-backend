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
dotenv.config();
mongoose
  .connect(
    process.env.MONGO_URI,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("db connected"));
mongoose.connection.on("error", (err) => {
  console.log(`db connection error: ${err.message}`);
});
// const connectDB = async () => {
//   try {
//     await mongoose.connect(
//       `mongodb+srv://dbUser:long123@cluster0.nm7vmys.mongodb.net/testnode2?retryWrites=true&w=majority`,
//       {
//         useNewUrlParser: true,
//         useUnifiedTopology: true,
//       }
//     );

//     console.log("MongoDB connected");
//   } catch (error) {
//     console.log(error.message);
//     process.exit(1);
//   }
// };
// connectDB();
const postRoutes = require("./routes/post");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");

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
        url: "http://localhost:8080/api",
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
app.use(cors());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api", postRoutes);
app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use(function (err, req, res, next) {
  if (err.name === "UnauthorizedError") {
    res.status(401).json({ error: "Unauthorized!" });
  }
});
const port = process.env.PORT || 8080;
// app.options("*", cors());
app.listen(port, () => {
  console.log(`a node js api listenting on port ${port}`);
});

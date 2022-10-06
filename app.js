const express = require("express");
const path = require("path");
const app = express();
const session = require("express-session");
const mongodbStore = require("connect-mongodb-session")(session);

if (process.env != "production") require("dotenv").config();

const authRouter = require("./routes/authRouter");
const urlRouter = require("./routes/urlRouter");
const viewRouter = require("./routes/viewRouter");

const store = new mongodbStore({
  uri: process.env.MONGODB_URI,
  collection: "sessions",
});

app.use(
  session({
    secret: "mySecret",
    resave: false,
    saveUninitialized: false,
    cookie: { expires: new Date(new Date().setDate(new Date().getDate() + 1)) },
    store: store,
  })
);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.listen(process.env.PORT || 5000, () => {
  console.log("Server Started!");
});

app.use(authRouter);
app.use(viewRouter);
app.use(urlRouter);

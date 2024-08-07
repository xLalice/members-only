const express = require("express");
const session = require("express-session");
const passport = require("passport");
const pgSession = require("connect-pg-simple")(session);
const helmet = require("helmet");
const cors = require("cors");
const pool = require("./db/pool");
const path = require("path");
const flash = require('connect-flash');
require("dotenv").config();

const indexRoutes = require("./routes/indexRoute")
const messageRoutes = require("./routes/messageRoutes");

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../public")));

app.use(
  session({
    store: new pgSession({
      pool,
      tableName: "session",
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 },
  })
);

app.use(flash());
app.use(passport.session());

app.use("/", indexRoutes);
app.use("/messages", messageRoutes);

app.use((req, res, next) => {
  res.status(404).send('404 Not Found');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;

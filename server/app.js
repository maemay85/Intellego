const path = require("path");
const express = require("express");
const morgan = require("morgan");
const keys = require("./config/dev");
const AppError = require("./utils/appError");
const app = express();

// Development logging
if (keys.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Body parser, reading data from body into req.body
app.use(express.json());

// static file-serving middleware
app.use(express.static(path.join(__dirname, "..", "public")));

// Send index.html for SPAs
app.get("/", (req, res) =>
  res.sendFile(path.join(__dirname, "..", "public/index.html"))
);

// Routes
app.use("/api", require("./api"));

// any remaining requests with an extension (.js, .css, etc.) send 404
app.use((req, res, next) => {
  if (path.extname(req.path).length) {
    const err = new AppError("Not found", 404);
    next(err);
  } else {
    next();
  }
});

// sends index.html
app.use("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public/index.html"));
});

// error handling endware

// @desc 404 Not Found error message
// @route -
// @access -
app.use((req, res, next) => {
  const error = new AppError(`Not Found - ${req.originalUrl}`, 404);
  next(error);
});

// @desc Global Error handler
// @route -
// @access -
app.use((err, req, res, next) => {
  console.log(err.stack);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
});

module.exports = app;

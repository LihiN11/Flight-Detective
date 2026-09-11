const path = require("node:path");
const express = require("express");

const {
  stages
} = require("./stages");

const apiRouter =
  require("./api");

const app =
  express();


/*
  EJS configuration
*/

app.set(
  "view engine",
  "ejs"
);

app.set(
  "views",
  path.join(
    __dirname,
    "..",
    "views"
  )
);


/*
  Middleware
*/

app.use(
  express.json()
);

app.use(
  express.static(
    path.join(
      __dirname,
      "..",
      "public"
    )
  )
);


/*
  Main game page
  GET /
*/

app.get("/", (req, res) => {
  res.render(
    "index",
    {
      title: "Flight Detective",
      stageCount: stages.length
    }
  );
});


/*
  Schemas page
  GET /schemas
*/

app.get(
  "/schemas",
  (req, res) => {
    res.render(
      "schemas",
      {
        title: "Flight Detective - API Schemas",

        schemas: [
          {
            resource: "Flights",

            fields: [
              ["id", "Number"],
              ["airline", "String"],
              ["from", "String"],
              ["to", "String"],
              ["price", "Number"],
              ["seats", "Number"]
            ]
          },

          {
            resource: "Bookings",

            fields: [
              ["id", "Number"],
              ["passenger", "String"],
              ["flightId", "Number"],
              ["seat", "String"]
            ]
          }
        ]
      }
    );
  }
);


/*
  API routes
*/

app.use(
  "/api",
  apiRouter
);


/*
  General 404
*/

app.use(
  (req, res) => {
    res.status(404).json({
      correct: false,
      message: "Route not found."
    });
  }
);


/*
  Invalid JSON error
*/

app.use(
  (
    err,
    req,
    res,
    next
  ) => {
    if (
      err instanceof SyntaxError &&
      err.status === 400 &&
      "body" in err
    ) {
      return res.status(400).json({
        correct: false,
        message:
          "The Request Body contains invalid JSON."
      });
    }

    console.error(err);

    return res.status(500).json({
      correct: false,
      message:
        "Internal server error."
    });
  }
);


module.exports = app;
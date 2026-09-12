const path = require("node:path");
const express = require("express");

const {
  stages
} = require("./stages");

const apiRouter =
  require("./api");

const app =
  express();


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


app.get("/", (req, res) => {
  res.render(
    "index",
    {
      title: "Flight Detective",
      stageCount: stages.length
    }
  );
});


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


app.use(
  "/api",
  apiRouter
);


app.use(
  (req, res) => {
    res.status(404).json({
      correct: false,
      message: "Route not found."
    });
  }
);


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
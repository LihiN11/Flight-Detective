const express = require("express");

const {
  data,
  nextId
} = require("./dataStore");

const {
  stages
} = require("./stages");

const router = express.Router();


/*
  Compare Query Parameters
*/

function sameQuery(actual, expected) {
  const actualKeys = Object.keys(actual).sort();
  const expectedKeys = Object.keys(expected).sort();

  if (actualKeys.length !== expectedKeys.length) {
    return false;
  }

  return expectedKeys.every(
    key =>
      String(actual[key]) ===
      String(expected[key])
  );
}


/*
  Compare Request Body

  The order of properties does not matter.
*/

function sameBody(actual, expected) {
  if (expected === null) {
    return (
      actual == null ||
      Object.keys(actual || {}).length === 0
    );
  }

  if (
    typeof actual !== "object" ||
    actual === null
  ) {
    return false;
  }

  const actualKeys = Object.keys(actual).sort();
  const expectedKeys = Object.keys(expected).sort();

  if (
    actualKeys.length !== expectedKeys.length
  ) {
    return false;
  }

  return expectedKeys.every(key => {
    return (
      Object.prototype.hasOwnProperty.call(
        actual,
        key
      ) &&
      actual[key] === expected[key]
    );
  });
}


/*
  Find the current stage
*/

function getStage(stageId) {
  const id = Number(stageId);

  return stages.find(
    stage => stage.id === id
  );
}


/*
  Check whether the request matches
  the correct solution of the stage.
*/

function validateStageRequest(req, stage) {
  const actualPath =
    `/api${req.path}`;

  return (
    req.method === stage.method &&
    actualPath === stage.path &&
    sameQuery(
      req.query,
      stage.query
    ) &&
    sameBody(
      req.body,
      stage.body
    )
  );
}


/*
  Send a JSON response to the client.
*/

function sendStageResult(
  res,
  stage,
  correct,
  status,
  payload,
  message
) {
  return res
    .status(status)
    .json({
      correct,
      stageId: stage.id,
      message,
      statusCode: status,
      data: payload
    });
}


/*
  GET /api/flights
*/

function getFlights(req, res, stage) {
  let flights = [...data.flights];

  /*
    Filter by destination
  */

  if (req.query.to) {
    flights = flights.filter(
      flight =>
        flight.to.toLowerCase() ===
        String(req.query.to).toLowerCase()
    );
  }

  /*
    Filter by departure location
  */

  if (req.query.from) {
    flights = flights.filter(
      flight =>
        flight.from.toLowerCase() ===
        String(req.query.from).toLowerCase()
    );
  }

  /*
    Sorting
  */

  if (req.query.sort) {
    const field =
      String(req.query.sort);

    const allowedFields = [
      "price",
      "seats"
    ];

    if (!allowedFields.includes(field)) {
      return sendStageResult(
        res,
        stage,
        false,
        400,
        null,
        "Invalid sort field. Use price or seats."
      );
    }

    flights.sort((a, b) => {
      const comparison =
        a[field] > b[field]
          ? 1
          : a[field] < b[field]
          ? -1
          : 0;

      if (
        req.query.order === "desc"
      ) {
        return -comparison;
      }

      return comparison;
    });
  }

  return sendStageResult(
    res,
    stage,
    true,
    200,
    flights,
    "Flights returned successfully."
  );
}


/*
  GET /api/flights/:id
*/

function getFlightById(
  req,
  res,
  stage
) {
  const id =
    Number(req.params.id);

  const flight =
    data.flights.find(
      item => item.id === id
    );

  if (!flight) {
    return sendStageResult(
      res,
      stage,
      true,
      404,
      null,
      "Not Found: the requested flight does not exist."
    );
  }

  return sendStageResult(
    res,
    stage,
    true,
    200,
    flight,
    "Flight returned successfully."
  );
}


/*
  POST /api/flights
*/

function createFlight(
  req,
  res,
  stage
) {
  const {
    airline,
    from,
    to,
    price,
    seats
  } = req.body || {};

  /*
    Server-side validation
  */

  if (
    typeof airline !== "string" ||
    typeof from !== "string" ||
    typeof to !== "string" ||
    typeof price !== "number" ||
    typeof seats !== "number"
  ) {
    return sendStageResult(
      res,
      stage,
      false,
      400,
      null,
      "Invalid body. airline, from and to must be strings, while price and seats must be numbers."
    );
  }

  if (
    airline.trim() === "" ||
    from.trim() === "" ||
    to.trim() === "" ||
    price < 0 ||
    seats < 0
  ) {
    return sendStageResult(
      res,
      stage,
      false,
      400,
      null,
      "Invalid flight data."
    );
  }

  const flight = {
    id: nextId(data.flights),
    airline,
    from,
    to,
    price,
    seats
  };

  data.flights.push(flight);

  return sendStageResult(
    res,
    stage,
    true,
    201,
    flight,
    "Flight created successfully."
  );
}


/*
  PATCH /api/flights/:id
*/

function updateFlight(
  req,
  res,
  stage
) {
  const id =
    Number(req.params.id);

  const flight =
    data.flights.find(
      item => item.id === id
    );

  if (!flight) {
    return sendStageResult(
      res,
      stage,
      false,
      404,
      null,
      "Not Found: the requested flight does not exist."
    );
  }

  const allowedFields = [
    "airline",
    "from",
    "to",
    "price",
    "seats"
  ];

  const body = req.body || {};

  const keys =
    Object.keys(body);

  if (
    keys.length === 0 ||
    keys.some(
      key =>
        !allowedFields.includes(key)
    )
  ) {
    return sendStageResult(
      res,
      stage,
      false,
      400,
      null,
      "Invalid PATCH body."
    );
  }

  /*
    Basic validation
  */

  if (
    body.price !== undefined &&
    (
      typeof body.price !== "number" ||
      body.price < 0
    )
  ) {
    return sendStageResult(
      res,
      stage,
      false,
      400,
      null,
      "Price must be a non-negative number."
    );
  }

  if (
    body.seats !== undefined &&
    (
      typeof body.seats !== "number" ||
      body.seats < 0
    )
  ) {
    return sendStageResult(
      res,
      stage,
      false,
      400,
      null,
      "Seats must be a non-negative number."
    );
  }

  keys.forEach(key => {
    flight[key] = body[key];
  });

  return sendStageResult(
    res,
    stage,
    true,
    200,
    flight,
    "Flight updated successfully."
  );
}


/*
  DELETE /api/bookings/:id
*/

function deleteBooking(
  req,
  res,
  stage
) {
  const id =
    Number(req.params.id);

  const index =
    data.bookings.findIndex(
      booking =>
        booking.id === id
    );

  if (index === -1) {
    return sendStageResult(
      res,
      stage,
      false,
      404,
      null,
      "Not Found: the requested booking does not exist."
    );
  }

  const deletedBooking =
    data.bookings.splice(
      index,
      1
    )[0];

  return sendStageResult(
    res,
    stage,
    true,
    200,
    deletedBooking,
    "Booking cancelled successfully."
  );
}


/*
  GET /api/flights/:id/bookings

  Nested REST resource
*/

function getFlightBookings(
  req,
  res,
  stage
) {
  const flightId =
    Number(req.params.id);

  const flight =
    data.flights.find(
      item => item.id === flightId
    );

  if (!flight) {
    return sendStageResult(
      res,
      stage,
      false,
      404,
      null,
      "Not Found: the requested flight does not exist."
    );
  }

  const bookings =
    data.bookings.filter(
      booking =>
        booking.flightId === flightId
    );

  return sendStageResult(
    res,
    stage,
    true,
    200,
    bookings,
    "Bookings returned successfully."
  );
}


/*
  Execute the actual API operation.
*/

function executeRequest(
  req,
  res,
  stage
) {
  const path =
    req.path;

  const method =
    req.method;


  /*
    GET all flights
  */

  if (
    method === "GET" &&
    path === "/flights"
  ) {
    return getFlights(
      req,
      res,
      stage
    );
  }


  /*
    GET one flight
  */

  const flightMatch =
    path.match(
      /^\/flights\/(\d+)$/
    );

  if (
    method === "GET" &&
    flightMatch
  ) {
    return getFlightById(
      req,
      res,
      stage
    );
  }


  /*
    POST flight
  */

  if (
    method === "POST" &&
    path === "/flights"
  ) {
    return createFlight(
      req,
      res,
      stage
    );
  }


  /*
    PATCH flight
  */

  const patchMatch =
    path.match(
      /^\/flights\/(\d+)$/
    );

  if (
    method === "PATCH" &&
    patchMatch
  ) {
    return updateFlight(
      req,
      res,
      stage
    );
  }


  /*
    DELETE booking
  */

  const bookingMatch =
    path.match(
      /^\/bookings\/(\d+)$/
    );

  if (
    method === "DELETE" &&
    bookingMatch
  ) {
    return deleteBooking(
      req,
      res,
      stage
    );
  }


  /*
    GET bookings belonging to a flight
  */

  const flightBookingsMatch =
    path.match(
      /^\/flights\/(\d+)\/bookings$/
    );

  if (
    method === "GET" &&
    flightBookingsMatch
  ) {
    return getFlightBookings(
      req,
      res,
      stage
    );
  }


  /*
    Unknown route
  */

  return sendStageResult(
    res,
    stage,
    false,
    404,
    null,
    "Route not found. Check the HTTP method and path."
  );
}


/*
  All API requests go through this middleware.
*/

router.all("*", (req, res) => {
  const stage =
    getStage(
      req.header("X-Stage-Id")
    );

  if (!stage) {
    return res.status(400).json({
      correct: false,
      message:
        "A valid X-Stage-Id header is required."
    });
  }

  /*
    First check whether the request
    matches the expected solution.
  */

  if (
    !validateStageRequest(
      req,
      stage
    )
  ) {
    return sendStageResult(
      res,
      stage,
      false,
      400,
      null,
      "Incorrect request for this stage. Check the Method, Path, Query Parameters and Request Body."
    );
  }

  /*
    If the request is correct,
    actually perform the operation.
  */

  return executeRequest(
    req,
    res,
    stage
  );
});


module.exports = router;
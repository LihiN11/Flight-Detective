const express = require("express");
const { data, nextId } = require("./dataStore");
const { stages } = require("./stages");

const router = express.Router();

function sameQuery(actual, expected) {
  const actualKeys = Object.keys(actual).sort();
  const expectedKeys = Object.keys(expected).sort();

  return (
    actualKeys.length === expectedKeys.length &&
    expectedKeys.every(
      key => String(actual[key]) === String(expected[key])
    )
  );
}

function sameBody(actual, expected) {
  if (expected === null) {
    return actual == null || Object.keys(actual || {}).length === 0;
  }

  if (typeof actual !== "object" || actual === null) {
    return false;
  }

  const actualKeys = Object.keys(actual).sort();
  const expectedKeys = Object.keys(expected).sort();

  return (
    actualKeys.length === expectedKeys.length &&
    expectedKeys.every(
      key =>
        Object.prototype.hasOwnProperty.call(actual, key) &&
        actual[key] === expected[key]
    )
  );
}

function getStage(stageId) {
  return stages.find(stage => stage.id === Number(stageId));
}

function validateStageRequest(req, stage) {
  return (
    req.method === stage.method &&
    `/api${req.path}` === stage.path &&
    sameQuery(req.query, stage.query) &&
    sameBody(req.body, stage.body)
  );
}

function sendStageResult(
  res,
  stage,
  correct,
  status,
  payload,
  message
) {
  return res.status(status).json({
    correct,
    stageId: stage.id,
    message,
    statusCode: status,
    data: payload
  });
}

function getFlights(query) {
  let flights = [...data.flights];

  if (query.to) {
    flights = flights.filter(
      flight =>
        flight.to.toLowerCase() === String(query.to).toLowerCase()
    );
  }

  if (query.from) {
    flights = flights.filter(
      flight =>
        flight.from.toLowerCase() === String(query.from).toLowerCase()
    );
  }

  if (query.sort) {
    const field = String(query.sort);

    flights.sort((a, b) => {
      const comparison =
        a[field] > b[field]
          ? 1
          : a[field] < b[field]
          ? -1
          : 0;

      return query.order === "desc"
        ? -comparison
        : comparison;
    });
  }

  return flights;
}

/*
  This returns a preview only.
  It never changes the data in memory.
*/
function getExpectedStageResult(stage) {
  const path = stage.path.replace("/api", "");
  const flightMatch = path.match(/^\/flights\/(\d+)$/);
  const bookingsMatch =
    path.match(/^\/flights\/(\d+)\/bookings$/);
  const bookingMatch = path.match(/^\/bookings\/(\d+)$/);

  if (stage.method === "GET" && path === "/flights") {
    return {
      statusCode: 200,
      data: getFlights(stage.query)
    };
  }

  if (stage.method === "GET" && bookingsMatch) {
    const flightId = Number(bookingsMatch[1]);
    const flight = data.flights.find(
      item => item.id === flightId
    );

    return flight
      ? {
          statusCode: 200,
          data: data.bookings.filter(
            booking => booking.flightId === flightId
          )
        }
      : {
          statusCode: 404,
          data: null
        };
  }

  if (stage.method === "GET" && flightMatch) {
    const flight = data.flights.find(
      item => item.id === Number(flightMatch[1])
    );

    return flight
      ? {
          statusCode: 200,
          data: flight
        }
      : {
          statusCode: 404,
          data: null
        };
  }

  if (stage.method === "POST" && path === "/flights") {
    return {
      statusCode: 201,
      data: {
        id: nextId(data.flights),
        ...stage.body
      }
    };
  }

  if (stage.method === "PATCH" && flightMatch) {
    const flight = data.flights.find(
      item => item.id === Number(flightMatch[1])
    );

    return flight
      ? {
          statusCode: 200,
          data: {
            ...flight,
            ...stage.body
          }
        }
      : {
          statusCode: 404,
          data: null
        };
  }

  if (stage.method === "DELETE" && bookingMatch) {
    const booking = data.bookings.find(
      item => item.id === Number(bookingMatch[1])
    );

    return booking
      ? {
          statusCode: 200,
          data: booking
        }
      : {
          statusCode: 404,
          data: null
        };
  }
if (stage.method === "POST" && path === "/bookings") {
  return {
    statusCode: 201,
    data: {
      id: nextId(data.bookings),
      ...stage.body
    }
  };
}

if (stage.method === "PATCH" && bookingMatch) {
  const booking = data.bookings.find(
    item => item.id === Number(bookingMatch[1])
  );

  return booking
    ? {
        statusCode: 200,
        data: {
          ...booking,
          ...stage.body
        }
      }
    : {
        statusCode: 404,
        data: null
      };
}

  return {
    statusCode: 404,
    data: null
  };
}function getAttemptedGetResponse(req) {
  if (req.method !== "GET") {
    return null;
  }

  if (req.path === "/flights") {
    return {
      statusCode: 200,
      data: getFlights(req.query)
    };
  }

  const bookingsMatch =
    req.path.match(/^\/flights\/(\d+)\/bookings$/);

  if (bookingsMatch) {
    const flightId = Number(bookingsMatch[1]);

    const flight = data.flights.find(
      item => item.id === flightId
    );

    return flight
      ? {
          statusCode: 200,
          data: data.bookings.filter(
            booking => booking.flightId === flightId
          )
        }
      : {
          statusCode: 404,
          data: null
        };
  }

  const flightMatch =
    req.path.match(/^\/flights\/(\d+)$/);

  if (flightMatch) {
    const flight = data.flights.find(
      item => item.id === Number(flightMatch[1])
    );

    return flight
      ? {
          statusCode: 200,
          data: flight
        }
      : {
          statusCode: 404,
          data: null
        };
  }

  return {
    statusCode: 404,
    data: null
  };
}

function stageGuard(handler) {
  return (req, res) => {
    const stage = getStage(req.header("X-Stage-Id"));

    if (!stage) {
      return res.status(400).json({
        correct: false,
        message: "A valid X-Stage-Id header is required."
      });
    }

    if (!validateStageRequest(req, stage)) {
      return res.status(400).json({
        correct: false,
        stageId: stage.id,
        message:
          "Incorrect request. Your request preview and the expected response are shown below.",
        statusCode: 400,
        data: null,
        attempted: getAttemptedGetResponse(req),
        expected: getExpectedStageResult(stage)
      });
    }

    return handler(req, res, stage);
  };
}

function getAllFlights(req, res, stage) {
  return sendStageResult(
    res,
    stage,
    true,
    200,
    getFlights(req.query),
    "Flights returned successfully."
  );
}

function getFlightById(req, res, stage) {
  const flight = data.flights.find(
    item => item.id === Number(req.params.id)
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

function createFlight(req, res, stage) {
  const { airline, from, to, price, seats } = req.body || {};

  if (
    typeof airline !== "string" ||
    typeof from !== "string" ||
    typeof to !== "string" ||
    typeof price !== "number" ||
    typeof seats !== "number" ||
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

function updateFlight(req, res, stage) {
  const flight = data.flights.find(
    item => item.id === Number(req.params.id)
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
  const keys = Object.keys(body);

  if (
    keys.length === 0 ||
    keys.some(key => !allowedFields.includes(key))
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

  if (
    body.price !== undefined &&
    (typeof body.price !== "number" || body.price < 0)
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
    (typeof body.seats !== "number" || body.seats < 0)
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

function deleteBooking(req, res, stage) {
  const index = data.bookings.findIndex(
    booking => booking.id === Number(req.params.id)
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

  const deletedBooking = data.bookings.splice(index, 1)[0];

  return sendStageResult(
    res,
    stage,
    true,
    200,
    deletedBooking,
    "Booking cancelled successfully."
  );
}

function getFlightBookings(req, res, stage) {
  const flightId = Number(req.params.id);
  const flight = data.flights.find(
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

  const bookings = data.bookings.filter(
    booking => booking.flightId === flightId
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

function createBooking(req, res, stage) {
  const { passenger, flightId, seat } = req.body || {};

  const flightExists = data.flights.some(
    flight => flight.id === flightId
  );

  if (
    typeof passenger !== "string" ||
    typeof flightId !== "number" ||
    typeof seat !== "string" ||
    passenger.trim() === "" ||
    seat.trim() === "" ||
    !flightExists
  ) {
    return sendStageResult(
      res,
      stage,
      false,
      400,
      null,
      "Invalid booking data."
    );
  }

  const booking = {
    id: nextId(data.bookings),
    passenger,
    flightId,
    seat
  };

  data.bookings.push(booking);

  return sendStageResult(
    res,
    stage,
    true,
    201,
    booking,
    "Booking created successfully."
  );
}

function updateBooking(req, res, stage) {
  const booking = data.bookings.find(
    item => item.id === Number(req.params.id)
  );

  if (!booking) {
    return sendStageResult(
      res,
      stage,
      false,
      404,
      null,
      "Booking not found."
    );
  }

  const body = req.body || {};
  const keys = Object.keys(body);

  if (
    keys.length === 0 ||
    keys.some(key => !["passenger", "seat"].includes(key))
  ) {
    return sendStageResult(
      res,
      stage,
      false,
      400,
      null,
      "Invalid booking update."
    );
  }

  if (
    typeof body.seat === "string" &&
    body.seat.trim() === ""
  ) {
    return sendStageResult(
      res,
      stage,
      false,
      400,
      null,
      "Seat cannot be empty."
    );
  }

  if (
    typeof body.passenger === "string" &&
    body.passenger.trim() === ""
  ) {
    return sendStageResult(
      res,
      stage,
      false,
      400,
      null,
      "Passenger cannot be empty."
    );
  }

  keys.forEach(key => {
    booking[key] = body[key];
  });

  return sendStageResult(
    res,
    stage,
    true,
    200,
    booking,
    "Booking updated successfully."
  );
}

router.get("/flights", stageGuard(getAllFlights));
router.get("/flights/:id", stageGuard(getFlightById));
router.post("/flights", stageGuard(createFlight));
router.patch("/flights/:id", stageGuard(updateFlight));
router.delete("/bookings/:id", stageGuard(deleteBooking));
router.get("/flights/:id/bookings", stageGuard(getFlightBookings));
router.post("/bookings", stageGuard(createBooking));
router.patch("/bookings/:id", stageGuard(updateBooking));


router.use(
  stageGuard((req, res, stage) => {
    return sendStageResult(
      res,
      stage,
      false,
      404,
      null,
      "Route not found."
    );
  })
);

module.exports = router;
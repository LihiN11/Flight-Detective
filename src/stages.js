/*
  The correct solutions are stored on the SERVER.

  This file must never be placed inside the public folder.
*/

const stages = [
  {
    id: 1,
    title: "Find a flight",
    description:
      "The user wants to display the flight whose ID is 3.",
    hint:
      "Use GET and a Route Parameter.",
    method: "GET",
    path: "/api/flights/3",
    query: {},
    body: null
  },

  {
    id: 2,
    title: "Find flights to Paris",
    description:
      "The user wants to display all flights whose destination is Paris.",
    hint:
      "Use GET and a Query Parameter.",
    method: "GET",
    path: "/api/flights",
    query: {
      to: "Paris"
    },
    body: null
  },

  {
    id: 3,
    title: "Find the cheapest Paris flight",
    description:
      "The user wants to find all flights to Paris, sorted from the cheapest to the most expensive.",
    hint:
      "Use Query Parameters for filtering and sorting.",
    method: "GET",
    path: "/api/flights",
    query: {
      to: "Paris",
      sort: "price",
      order: "asc"
    },
    body: null
  },

  {
    id: 4,
    title: "Add a new flight",
    description:
      "Add a new flight from TLV to Rome using ITA Airways. The price is 220 and there are 10 available seats.",
    hint:
      "Use POST and send the flight information as JSON in the Request Body.",
    method: "POST",
    path: "/api/flights",
    query: {},
    body: {
      airline: "ITA Airways",
      from: "TLV",
      to: "Rome",
      price: 220,
      seats: 10
    }
  },

  {
    id: 5,
    title: "Update a flight",
    description:
      "Change flight 2 so that the number of available seats becomes 10.",
    hint:
      "Use PATCH, a Route Parameter and a JSON Request Body.",
    method: "PATCH",
    path: "/api/flights/2",
    query: {},
    body: {
      seats: 10
    }
  },

  {
    id: 6,
    title: "Cancel a booking",
    description:
      "Cancel booking number 4.",
    hint:
      "Use DELETE and a Route Parameter.",
    method: "DELETE",
    path: "/api/bookings/4",
    query: {},
    body: null
  },

  {
    id: 7,
    title: "Find bookings for a flight",
    description:
      "Display all bookings that belong to flight number 3.",
    hint:
      "Use GET and a nested REST resource.",
    method: "GET",
    path: "/api/flights/3/bookings",
    query: {},
    body: null
  },

  {
    id: 8,
    title: "Find a missing flight",
    description:
      "The user wants to find flight number 999. The flight does not exist. Your goal is to receive the correct 404 Not Found response.",
    hint:
      "Use GET and a Route Parameter. A 404 response is expected.",
    method: "GET",
    path: "/api/flights/999",
    query: {},
    body: null
  }
];

module.exports = {
  stages
};
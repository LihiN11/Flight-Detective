const stages = [
  {
    id: 1,
    title: "Find a flight",
    description:
      "The user wants to display the flight whose ID is 3.",
    hint:
      "Use GET and include the flight ID in the path.",
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
      "Use GET with the to Query Parameter.",
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
      "Find all flights to Paris, sorted from cheapest to most expensive.",
    hint:
      "Use to=Paris, sort=price and order=asc.",
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
      "Use POST to /api/flights and send JSON.",
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
      "Use PATCH and send the updated seats value as JSON.",
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
      "This is a booking, so use /api/bookings/4, not /api/flights/4.",
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
      "Start with the flight path, then add /bookings.",
    method: "GET",
    path: "/api/flights/3/bookings",
    query: {},
    body: null
  },
  {
    id: 8,
    title: "Find a missing flight",
    description:
      "The user wants to find flight number 999. The flight does not exist.",
    hint:
      "Use GET. A 404 Not Found response is expected.",
    method: "GET",
    path: "/api/flights/999",
    query: {},
    body: null
  },
  {
    id: 9,
    title: "Create a booking",
    description:
      "Create a booking for Amit on flight 1 in seat 10A.",
    hint:
      "This is a booking, so use POST to /api/bookings and send JSON.",
    method: "POST",
    path: "/api/bookings",
    query: {},
    body: {
      passenger: "Amit",
      flightId: 1,
      seat: "10A"
    }
  },
  {
    id: 10,
    title: "Update a booking",
    description:
      "Change booking 2 so that its seat becomes 9B.",
    hint:
      "This is a booking, so use PATCH on /api/bookings/2.",
    method: "PATCH",
    path: "/api/bookings/2",
    query: {},
    body: {
      seat: "9B"
    }
  },
  {
    id: 11,
    title: "Sort a flight's bookings",
    description:
      "Display all bookings for flight 3, sorted alphabetically by passenger name.",
    hint:
      "Combine the nested bookings Route Parameter with a sort Query Parameter.",
    method: "GET",
    path: "/api/flights/3/bookings",
    query: {
      sort: "passenger"
    },
    body: null
  }
];

module.exports = {
  stages
};
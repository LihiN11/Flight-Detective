const fs = require("node:fs");
const path = require("node:path");

const filePath = path.join(
  __dirname,
  "..",
  "data",
  "data.json"
);

const initialData = JSON.parse(
  fs.readFileSync(filePath, "utf8")
);

const data = {
  flights: structuredClone(initialData.flights),
  bookings: structuredClone(initialData.bookings)
};

function nextId(items) {
  if (items.length === 0) {
    return 1;
  }

  return Math.max(
    ...items.map(item => item.id)
  ) + 1;
}

module.exports = {
  data,
  nextId
};
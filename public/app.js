const stages = [
  {
    id: 1,
    title: "Find a flight",
    description: "The user wants to display the flight whose ID is 3.",
    hint: "Use GET and a Route Parameter."
  },
  {
    id: 2,
    title: "Find flights to Paris",
    description:
      "The user wants to display all flights whose destination is Paris.",
    hint: "Use GET and a Query Parameter."
  },
  {
    id: 3,
    title: "Find the cheapest Paris flight",
    description:
      "The user wants to find all flights to Paris, sorted from the cheapest to the most expensive.",
    hint: "Use to=Paris, sort=price and order=asc."
  },
  {
    id: 4,
    title: "Add a new flight",
    description:
      "Add a new flight from TLV to Rome using ITA Airways. The price is 220 and there are 10 available seats.",
    hint: "Use POST and send the flight information as JSON."
  },
  {
    id: 5,
    title: "Update a flight",
    description:
      "Change flight 2 so that the number of available seats becomes 10.",
    hint: "Use PATCH, a Route Parameter and a JSON Request Body."
  },
  {
    id: 6,
    title: "Cancel a booking",
    description: "Cancel booking number 4.",
    hint: "Use DELETE and a Route Parameter."
  },
  {
    id: 7,
    title: "Find bookings for a flight",
    description:
      "Display all bookings that belong to flight number 3.",
    hint: "Use GET and a nested REST resource."
  },
  {
    id: 8,
    title: "Find a missing flight",
    description:
      "The user wants to find flight number 999. The flight does not exist.",
    hint: "Use GET and a Route Parameter. A 404 response is expected."
  },
  {
    id: 9,
    title: "Create a booking",
    description:
      "Create a booking for Amit on flight 1 in seat 10A.",
    hint:
      "This is a booking, so use POST to /api/bookings and send JSON."
  },
  {
    id: 10,
    title: "Update a booking",
    description:
      "Change booking 2 so that its seat becomes 9B.",
    hint:
      "This is a booking, so use PATCH on /api/bookings/2."
  }
];

let currentStage = 0;

const form = document.querySelector("#request-form");
const methodInput = document.querySelector("#method");
const pathInput = document.querySelector("#path");
const bodyInput = document.querySelector("#body");
const queryList = document.querySelector("#query-list");

const responsePanel = document.querySelector("#response-panel");
const responseTitle = document.querySelector("#response-title");
const responseMessage = document.querySelector("#response-message");
const responseData = document.querySelector("#response-data");
const statusBadge = document.querySelector("#status-badge");

const expectedPanel = document.querySelector("#expected-panel");
const expectedStatusBadge = document.querySelector(
  "#expected-status-badge"
);
const expectedResponseData = document.querySelector(
  "#expected-response-data"
);

const nextArea = document.querySelector("#next-area");
const nextButton = document.querySelector("#next-button");

function addQueryRow() {
  const row = document.createElement("div");

  row.className = "query-row";

  row.innerHTML = `
    <input class="query-key" placeholder="parameter">
    <span>=</span>
    <input class="query-value" placeholder="value">
    <button type="button" class="remove-query">×</button>
  `;

  row
    .querySelector(".remove-query")
    .addEventListener("click", () => row.remove());

  queryList.appendChild(row);
}

function renderStage() {
  const stage = stages[currentStage];

  document.querySelector("#stage-title").textContent =
    stage.title;

  document.querySelector("#stage-description").textContent =
    stage.description;

  document.querySelector("#stage-hint").textContent =
    `Hint: ${stage.hint}`;

  document.querySelector("#stage-counter").textContent =
    `Mission ${stage.id} of ${stages.length}`;

  document.querySelector("#progress-bar").style.width =
    `${(stage.id / stages.length) * 100}%`;

  methodInput.value = "GET";
  pathInput.value = "";
  bodyInput.value = "";
  queryList.innerHTML = "";

  addQueryRow();

  responsePanel.classList.add("hidden");
  expectedPanel.classList.add("hidden");
  nextArea.classList.add("hidden");
}

function readQueryParams() {
  const params = new URLSearchParams();

  document.querySelectorAll(".query-row").forEach(row => {
    const key = row.querySelector(".query-key").value.trim();
    const value = row.querySelector(".query-value").value.trim();

    if (key) {
      params.set(key, value);
    }
  });

  return params;
}

function buildUrl() {
  const path = pathInput.value.trim();
  const query = readQueryParams().toString();

  return query ? `${path}?${query}` : path;
}

function parseBody() {
  const text = bodyInput.value.trim();

  if (!text) {
    return undefined;
  }

  return JSON.parse(text);
}

async function sendRequest(event) {
  event.preventDefault();

  responsePanel.classList.remove("hidden");
  expectedPanel.classList.add("hidden");
  nextArea.classList.add("hidden");

  responseTitle.textContent = "Sending request...";
  responseMessage.textContent = "";
  responseData.textContent = "";
  statusBadge.textContent = "";

  let body;

  try {
    body = parseBody();
  } catch {
    responseTitle.textContent = "Request not sent";
    responseMessage.textContent =
      "Request Body is not valid JSON.";
    statusBadge.textContent = "Client error";
    statusBadge.className = "status-error";
    return;
  }

  const options = {
    method: methodInput.value,
    headers: {
      "X-Stage-Id": String(stages[currentStage].id)
    }
  };

  if (body !== undefined) {
    options.headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(buildUrl(), options);
    const result = await response.json();
    const isCorrect = result.correct === true;

    responseTitle.textContent = isCorrect
      ? "Mission complete! ✈️"
      : "Not quite...";

    responseMessage.textContent =
      result.message || "No message returned.";

    statusBadge.textContent =
      `${response.status} ${response.statusText}`;

    statusBadge.className = isCorrect
      ? "status-success"
      : "status-error";

    const attemptedResponse =
      result.attempted || {
        statusCode: response.status,
        data: result.data
      };

    statusBadge.textContent =
      `${attemptedResponse.statusCode}`;

    responseData.textContent = JSON.stringify(
      attemptedResponse.data,
      null,
      2
    );

    const expectedResponse = result.expected || {
      statusCode: response.status,
      data: result.data
    };

    expectedPanel.classList.remove("hidden");

    expectedStatusBadge.textContent =
      `${expectedResponse.statusCode}`;

    expectedStatusBadge.className = "status-success";

    expectedResponseData.textContent = JSON.stringify(
      expectedResponse.data,
      null,
      2
    );

    if (isCorrect) {
      nextArea.classList.remove("hidden");

      nextButton.textContent =
        currentStage === stages.length - 1
          ? "Finish Game ✓"
          : "Next Mission →";
    }
  } catch (error) {
    responseTitle.textContent = "Connection error";
    responseMessage.textContent =
      "The server could not be reached. Make sure the Node.js server is running.";
    statusBadge.textContent = "Network error";
    statusBadge.className = "status-error";
    responseData.textContent = error.message;
  }
}

function nextStage() {
  if (currentStage === stages.length - 1) {
    responseTitle.textContent =
      "You completed all missions! ✈️";

    responseMessage.textContent =
      "Excellent work! You completed every mission.";

    nextArea.classList.add("hidden");
    return;
  }

  currentStage++;
  renderStage();

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

document
  .querySelector("#add-query")
  .addEventListener("click", addQueryRow);

form.addEventListener("submit", sendRequest);
nextButton.addEventListener("click", nextStage);

renderStage();
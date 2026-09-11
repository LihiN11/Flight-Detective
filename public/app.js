const stages = [

  {
    id: 1,

    title: "Find a flight",

    description:
      "The user wants to display the flight whose ID is 3.",

    hint:
      "Use GET and a Route Parameter."
  },


  {
    id: 2,

    title: "Find flights to Paris",

    description:
      "The user wants to display all flights whose destination is Paris.",

    hint:
      "Use GET and a Query Parameter."
  },


  {
    id: 3,

    title: "Find the cheapest Paris flight",

    description:
      "The user wants to find all flights to Paris, sorted from the cheapest to the most expensive.",

    hint:
      "Use Query Parameters for filtering and sorting."
  },


  {
    id: 4,

    title: "Add a new flight",

    description:
      'Add a new flight from TLV to Rome using ITA Airways. The price is 220 and there are 10 available seats.',

    hint:
      "Use POST and send the flight information as JSON in the Request Body."
  },


  {
    id: 5,

    title: "Update a flight",

    description:
      "Change flight 2 so that the number of available seats becomes 10.",

    hint:
      "Use PATCH, a Route Parameter and a JSON Request Body."
  },


  {
    id: 6,

    title: "Cancel a booking",

    description:
      "Cancel booking number 4.",

    hint:
      "Use DELETE and a Route Parameter."
  },


  {
    id: 7,

    title: "Find bookings for a flight",

    description:
      "Display all bookings that belong to flight number 3.",

    hint:
      "Use GET and a nested REST resource."
  },


  {
    id: 8,

    title: "Find a missing flight",

    description:
      "The user wants to find flight number 999. The flight does not exist. Your goal is to receive the correct 404 Not Found response.",

    hint:
      "Use GET and a Route Parameter. A 404 response is expected."
  }

];


let currentStage = 0;


/*
  DOM elements
*/

const form =
  document.querySelector(
    "#request-form"
  );

const methodInput =
  document.querySelector(
    "#method"
  );

const pathInput =
  document.querySelector(
    "#path"
  );

const bodyInput =
  document.querySelector(
    "#body"
  );

const queryList =
  document.querySelector(
    "#query-list"
  );

const responsePanel =
  document.querySelector(
    "#response-panel"
  );

const responseTitle =
  document.querySelector(
    "#response-title"
  );

const responseMessage =
  document.querySelector(
    "#response-message"
  );

const responseData =
  document.querySelector(
    "#response-data"
  );

const statusBadge =
  document.querySelector(
    "#status-badge"
  );

const nextArea =
  document.querySelector(
    "#next-area"
  );

const nextButton =
  document.querySelector(
    "#next-button"
  );


/*
  Display current stage
*/

function renderStage() {

  const stage =
    stages[currentStage];


  document.querySelector(
    "#stage-title"
  ).textContent =
    stage.title;


  document.querySelector(
    "#stage-description"
  ).textContent =
    stage.description;


  document.querySelector(
    "#stage-hint"
  ).textContent =
    `Hint: ${stage.hint}`;


  document.querySelector(
    "#stage-counter"
  ).textContent =
    `Mission ${stage.id} of ${stages.length}`;


  document.querySelector(
    "#progress-bar"
  ).style.width =
    `${(stage.id / stages.length) * 100}%`;


  /*
    Reset form
  */

  methodInput.value =
    "GET";

  pathInput.value =
    "";

  bodyInput.value =
    "";

  queryList.innerHTML =
    "";


  /*
    Start with one empty Query Parameter row
  */

  addQueryRow();


  /*
    Hide old response
  */

  responsePanel.classList.add(
    "hidden"
  );

  nextArea.classList.add(
    "hidden"
  );
}


/*
  Add Query Parameter row
*/

function addQueryRow() {

  const row =
    document.createElement(
      "div"
    );

  row.className =
    "query-row";


  row.innerHTML = `
    <input
      class="query-key"
      placeholder="parameter"
    >

    <span>=</span>

    <input
      class="query-value"
      placeholder="value"
    >

    <button
      type="button"
      class="remove-query"
    >
      ×
    </button>
  `;


  row
    .querySelector(
      ".remove-query"
    )
    .addEventListener(
      "click",
      () => {
        row.remove();
      }
    );


  queryList.appendChild(
    row
  );
}


/*
  Read Query Parameters
*/

function readQueryParams() {

  const params =
    new URLSearchParams();


  document
    .querySelectorAll(
      ".query-row"
    )
    .forEach(row => {

      const key =
        row
          .querySelector(
            ".query-key"
          )
          .value
          .trim();


      const value =
        row
          .querySelector(
            ".query-value"
          )
          .value
          .trim();


      if (key) {
        params.set(
          key,
          value
        );
      }

    });


  return params;
}


/*
  Build URL
*/

function buildUrl() {

  const query =
    readQueryParams()
      .toString();


  const path =
    pathInput.value.trim();


  if (!query) {
    return path;
  }


  return `${path}?${query}`;
}


/*
  Convert Request Body
  from text to JSON
*/

function parseBody() {

  const text =
    bodyInput.value.trim();


  if (!text) {
    return undefined;
  }


  try {

    return JSON.parse(
      text
    );

  } catch {

    throw new Error(
      "Request Body is not valid JSON."
    );

  }
}


/*
  Send HTTP Request
*/

async function sendRequest(event) {

  event.preventDefault();


  responsePanel.classList.remove(
    "hidden"
  );


  nextArea.classList.add(
    "hidden"
  );


  responseTitle.textContent =
    "Sending request...";


  responseMessage.textContent =
    "";


  responseData.textContent =
    "";


  statusBadge.textContent =
    "";


  let body;


  /*
    Try to parse JSON body
  */

  try {

    body =
      parseBody();

  } catch (error) {

    responseTitle.textContent =
      "Request not sent";


    responseMessage.textContent =
      error.message;


    statusBadge.textContent =
      "Client error";


    statusBadge.className =
      "status-error";


    return;
  }


  /*
    Fetch options
  */

  const options = {

    method:
      methodInput.value,

    headers: {

      /*
        Tell the server
        which stage is active.
      */

      "X-Stage-Id":
        String(
          stages[currentStage].id
        )

    }

  };


  /*
    Add Request Body
    only when there is one.
  */

  if (
    body !== undefined
  ) {

    options.headers[
      "Content-Type"
    ] =
      "application/json";


    options.body =
      JSON.stringify(
        body
      );
  }


  try {

    /*
      REAL HTTP REQUEST
    */

    const response =
      await fetch(
        buildUrl(),
        options
      );


    /*
      Convert response
      to JSON
    */

    const result =
      await response.json();


    const isCorrect =
      result.correct === true;


    /*
      Display success/error
    */

    responseTitle.textContent =
      isCorrect
        ? "Mission complete! ✈️"
        : "Not quite...";


    responseMessage.textContent =
      result.message ||
      "No message returned.";


    /*
      Display HTTP Status Code
    */

    statusBadge.textContent =
      `${response.status} ${response.statusText}`;


    statusBadge.className =
      isCorrect
        ? "status-success"
        : "status-error";


    /*
      Display returned data
    */

    responseData.textContent =
      JSON.stringify(
        result.data,
        null,
        2
      );


    /*
      If correct,
      allow the user to continue.
    */

    if (isCorrect) {

      nextArea.classList.remove(
        "hidden"
      );


      if (
        currentStage ===
        stages.length - 1
      ) {

        nextButton.textContent =
          "Finish Game ✓";

      } else {

        nextButton.textContent =
          "Next Mission →";

      }

    }

  } catch (error) {

    /*
      Network error
    */

    responseTitle.textContent =
      "Connection error";


    responseMessage.textContent =
      "The server could not be reached. Make sure the Node.js server is running.";


    statusBadge.textContent =
      "Network error";


    statusBadge.className =
      "status-error";


    responseData.textContent =
      error.message;
  }
}


/*
  Move to next stage
*/

function nextStage() {

  /*
    Last stage
  */

  if (
    currentStage ===
    stages.length - 1
  ) {

    responseTitle.textContent =
      "You completed all missions! ✈️";


    responseMessage.textContent =
      "Excellent work! You practiced HTTP Methods, REST Routes, Route Parameters, Query Parameters, Request Body, AJAX and HTTP Status Codes.";


    nextArea.classList.add(
      "hidden"
    );


    return;
  }


  currentStage++;


  renderStage();


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


/*
  Event Listeners
*/

document
  .querySelector(
    "#add-query"
  )
  .addEventListener(
    "click",
    addQueryRow
  );


form.addEventListener(
  "submit",
  sendRequest
);


nextButton.addEventListener(
  "click",
  nextStage
);


/*
  Start game
*/

renderStage();
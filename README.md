# HTTP Detective

A small learning game for practicing HTTP, REST, AJAX, Route Parameters, Query Parameters, Request Body and HTTP Status Codes.

## Requirements

- Node.js 18 or newer

## Installation

Open a terminal in the project folder and run:

```bash
npm install
```

## Run

```bash
npm start
```

For automatic restart while developing:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

The API schemas page is available at:

```text
http://localhost:3000/schemas
```

## Project structure

```text
Flight-Detective/
├── data/
│   └── data.json
├── public/
│   ├── app.js
│   └── styles.css
├── src/
│   ├── api.js
│   ├── app.js
│   ├── dataStore.js
│   ├── server.js
│   └── stages.js
├── views/
│   ├── index.ejs
│   └── schemas.ejs
├── package.json
└── README.md
```

## Important implementation choices

- The server uses Node.js and Express.
- The initial pages are rendered with EJS.
- The game sends requests with `fetch()` and does not reload the HTML page.
- The client uses Vanilla JavaScript only.
- Data is loaded from JSON and then kept in server memory.
- POST, PATCH and DELETE change the in-memory data, so later requests can see the changes.
- Correct answers for the stages are stored only in `src/stages.js`, on the server.
- Every game request sends the current stage ID in the `X-Stage-Id` HTTP header.
- The server validates the Method, path, Query Parameters and Request Body.
- API endpoints are under `/api`.
- The game page is `/`.
- The schemas page is `/schemas`.

## Stages covered

1. GET + Route Parameter
2. GET + Query Parameter
3. GET + multiple Query Parameters + sorting
4. POST + Request Body
5. PATCH + Route Parameter + Request Body
6. DELETE + Route Parameter
7. GET + related resources + Route Parameter
8. GET + Route Parameter + expected 404 Not Found
9. POST + Request Body (Bookings resource)
10. PATCH + Route Parameter + Request Body (Bookings resource)
11. GET + Route Parameter + Query Parameter (sort the nested bookings of one flight)
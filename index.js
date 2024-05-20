const express = require("express");
const bodyParser = require("body-parser");
const scraper = require("./routes/scrape");
const { auditLoggingMiddleware } = require("./middlewares/audit-logging");
const { console } = require("./utils/logger");
var cors = require("cors");

const PORT = process.env.PORT || 8000;
const app = express();

var corsOptions = {
  // origin: "http://example.com",
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};
// app.use(cors(corsOptions)); // for all routes

// create application/json parser
var jsonParser = bodyParser.json();
app.use(jsonParser);

// auditing
app.use(auditLoggingMiddleware);

app.use("/scrape", (req, res, next) => {
  res.header("Content-Type", "application/json");
  next();
});
app.use((err, req, res, next) => {
  console.error(err);
});

app
  .get("/", (req, res) => {
    res.send("welcome!");
  })
  .route("/scrape/:rows(\\d+)?")
  .get((req, res, next) => {
    scraper.scrapeSourcesListAsync(null, req.params?.rows).then((data) => {
      res.json(data);
    });
  });

app.get(
  "/news/:category/:rows(\\d+)?",
  cors(corsOptions),
  function (req, res, next) {
    scraper
      .scrapeSourcesListAsync(null, req.params.category, req.params?.rows)
      .then((data) => {
        res.json(data);
      });
  }
);

app.route("/TMDB/scrape/:rows(\\d+)?").get((req, res, next) => {
  scraper.performScraping(null, req.params?.rows).then((data) => {
    res.json(data);
  });
});

// POST /api/TMDB/scrape gets JSON body from TMDB
app.post("/TMDB/scrape/:rows(\\d+)?", (req, res, next) => {
  scraper
    .performScraping(req.body?.filename || "", req.params?.rows)
    .then((data) => {
      res.json(data);
    });
});

app.post("/scrape/:rows(\\d+)?", (req, res, next) => {
  scraper
    .scrapeSourcesListAsync(req.body?.filename || "", req.params?.rows)
    .then((data) => {
      res.json(data);
    });
});

app.listen(PORT, () => {
  console.log(`App is listening on port ${PORT}`);
});

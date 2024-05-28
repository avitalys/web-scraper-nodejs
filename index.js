const express = require("express");
const expressCache = require("cache-express");
const bodyParser = require("body-parser");
const scraper = require("./routes/scrape");
const { auditLoggingMiddleware } = require("./middlewares/audit-logging");
const { console } = require("./utils/logger");
var cors = require("cors");

const PORT = process.env.PORT || 8000;
const app = express();

// cacheing middleWare configuration with options
let cacheOptions = expressCache({
  // dependsOn: () => [postCount],
  //timeOut: 40000, // default 1 hour
  onTimeout: (key, value) => {
    console.log(`Cache removed for key: ${key}`);
  },
});

// setting CORS headers options
var corsOptions = {
  // origin: "http://example.com",
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};
// middleware for all routes
// app.use(cors(corsOptions));

// create application/json parser middleware
app.use(bodyParser.json());

// auditing middlware
app.use(auditLoggingMiddleware);

// console.error middlware
app.use((err, req, res, next) => {
  console.error(err);
});

// Content-Type for /scrape route
app.use("/scrape", (req, res, next) => {
  res.header("Content-Type", "application/json");
  next();
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
  [cors(corsOptions), cacheOptions],
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

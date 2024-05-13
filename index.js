const express = require("express");
const bodyParser = require("body-parser");
const scraper = require("./routes/scrape");
const { auditLoggingMiddleware } = require("./middlewares/audit-logging");
const { console } = require("./utils/logger");

const PORT = process.env.PORT || 8000;
const app = express();

// create application/json parser
var jsonParser = bodyParser.json();
app.use(jsonParser);

// auditing
app.use(auditLoggingMiddleware);

app.use("/scrape", (req, res, next) => {
  res.header("Content-Type", "application/json");
  next();
});

app
  .get("/", (req, res) => {
    res.send("welcome!");
  })
  .route("/scrape/:rows")
  .get((req, res, next) => {
    scraper.performScraping(null, req.params?.rows).then((data) => {
      res.json(data);
    });
  });

// POST /api/scrape gets JSON body
app.post("/scrape/:rows", (req, res, next) => {
  scraper
    .performScraping(req.body?.filename || "", req.params?.rows)
    .then((data) => {
      res.json(data);
    });
});

app.listen(PORT, () => {
  console.log(`App is listening on port ${PORT}`);
});

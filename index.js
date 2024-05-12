const express = require("express");
const scraper = require("./routes/scrape");
const { auditLoggingMiddleware } = require("./middlewares/audit-logging");

const PORT = process.env.PORT || 8000;
const app = express();

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
  .route("/scrape")
  .get((req, res, next) => {
    scraper.performScraping().then((data) => {
      res.json(data);
    });
  });

app.listen(PORT, () => {
  console.log(`App is listening on port ${PORT}`);
});

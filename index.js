const express = require("express");
const scraper = require("./scraper");

const PORT = 8000;

const app = express();

app.use(function (req, res, next) {
  res.header("Content-Type", "application/json");
  next();
});

app
  .get("/", (req, res) => {
    res.send("Hello World!");
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

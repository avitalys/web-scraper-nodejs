const cheerio = require("cheerio");
const axios = require("axios");
const express = require("express");
const fs = require("fs");

const PORT = 8000;
// const URL = "https://www.theguardian.com/international";
const URL = "https://m.imdb.com/chart/tvmeter/?ref_=nv_tvv_mptv";

// downloading the target web page
// by performing an HTTP GET request in Axios
const dowloadPage = async () => {
  try {
    const response = await axios.request({
      method: "GET",
      url: URL,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
      },
    });

    return response.data;
  } catch (error) {
    console.log(`Request failed with ${error.message}`);
  }
};

const performScraping = async () => {
  const html = await dowloadPage();

  const scrappedData = [];
  const $ = cheerio.load(html);

  $(".ipc-metadata-list-summary-item", html).each((index, element) => {
    const title = $(element).find(".ipc-title").text();
    const tumbnail = $(element).find(".ipc-image").attr("src");
    const type = $(element).find(".cli-title-type-data").text();

    const rank = $(element).find(".cli-meter-title-header").text();
    const rating = $(element).find(".ipc-rating-star").text().trim();
    //const votes = $(element).find(".ipc-rating-star > span").text().trim();
    const data1 = $(element).find(".cli-title-metadata").text();

    scrappedData.push({
      title,
      tumbnail,
      type,
      rank,
      rating,
      /*votes,*/ data1,
    });
  });

  //console.log(JSON.stringify(scrappedData));
  fs.writeFile("./dist/data.json", JSON.stringify(scrappedData), (err) => {
    if (err) throw err;
    console.log("Done writing");
  });
};

const app = express();

app.listen(PORT, () => {
  console.log(`app running on port ${PORT}`);
  performScraping();
});

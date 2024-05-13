const cheerio = require("cheerio");
const axios = require("axios");

const { DEFAULTS } = require("../consts");
const { saveToFile } = require("../utils/fsmgr");
const { console } = require("../utils/logger");

// downloading the target web page by performing an HTTP GET request in Axios
const dowloadPage = async () => {
  try {
    const response = await axios.request({
      method: "GET",
      url: DEFAULTS.URL,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Request failed with ${error.message}`);
  }
};

const performScraping = async (filename, rows) => {
  try {
    const html = await dowloadPage();

    const scrappedData = [];
    const $ = cheerio.load(html);

    $(".ipc-metadata-list-summary-item", html).each((index, element) => {
      if (rows && rows <= index) return false;

      const title = $(element).find(".ipc-title").text();
      const tumbnail = $(element).find(".ipc-image").attr("src");
      const type = $(element).find(".cli-title-type-data").text();

      const rank = $(element).find(".cli-meter-title-header").text();
      const rating = $(element).find(".ipc-rating-star").text().trim();
      const data1 = $(element).find(".cli-title-metadata").text();

      scrappedData.push({
        title,
        tumbnail,
        type,
        rank,
        rating,
        data1,
      });
    });

    if (filename) {
      saveToFile(filename, scrappedData);
    } else {
      return scrappedData;
    }
  } catch (err) {
    console.error(
      new Error(`Scraping action failed with error: ${err.message}`, {
        cause: err,
      })
    );
  }
};

module.exports = {
  performScraping,
};

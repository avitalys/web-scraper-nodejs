const cheerio = require("cheerio");
const axios = require("axios");

const { DEFAULTS } = require("../consts");
const { saveToFile } = require("../utils/fsmgr");
const { console } = require("../utils/logger");

// downloading the target web page by performing an HTTP GET request in Axios
const dowloadPage = async (url = DEFAULTS.URL) => {
  try {
    const response = await axios.request({
      method: "GET",
      url: url,
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

const newspapers = [
  {
    name: "The Telegraph",
    address: "https://www.telegraph.co.uk/@/",
    root: "#main-content > section:first",
    urlbase: "https://www.telegraph.co.uk",
    imagebase: "https://www.telegraph.co.uk/",
  },
  {
    name: "The New York Times",
    address: "https://www.nytimes.com/international/section/@",
    root: "#collection-highlights-container",
    urlbase: "https://www.nytimes.com",
    imagebase: "",
  },
  {
    name: "The Gurdian",
    address: "https://www.theguardian.com/@/all",
    root: "section:first",
    urlbase: "",
    imagebase: "",
  },
  // {
  //   name: "Reuters",
  //   address: "https://www.reuters.com/technology/",
  //   root: ".main-content",
  //   urlbase: "https://www.reuters.com/",
  //   imagebase: "",
  // },
  // {
  //   name: "Washington Post",
  //   address: "https://www.washingtonpost.com/@/",
  //   root: "",
  //   urlbase: "",
  //   imagebase: "",
  // },
];

const catogeries = [
  "technology",
  "science",
  "business",
  "enviornment",
  "food",
  "music",
  "games",
  "culture",
  "travel",
  "music",
  "health",
  "sport",
  "style",
];

const scrapeSourcesListAsync = async (filename, category, rows) => {
  const scrappedData = [];

  try {
    if (!catogeries.includes(category)) throw "cannot return data";

    const Pages = await Promise.all(
      newspapers.map(async (source) => {
        const html = await dowloadPage(source.address.replace("@", category));

        if (typeof html !== "string") return false;
        const $ = cheerio.load(html);

        $(`${source.root ?? "body"} li`, html).each((index, element) => {
          if (rows && rows <= index) return false;

          const image = $(element).find("img").attr("src") ?? "";
          const time = $(element).find("time").attr("datetime") ?? "";

          const href = $(element).find("a:first");
          const title = href.text().trim() ?? "";
          const url = href.attr("href") ?? "";

          if (title !== "" || url !== "") {
            scrappedData.push({
              title,
              image: image && source.imagebase + image,
              url: source.urlbase + url,
              source: source.name,
              time,
            });
          }
        });
      })
    );

    if (filename) {
      saveToFile(filename, scrappedData);
    } else {
      return scrappedData;
    }
  } catch (error) {
    console.error(error);
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
      new Error(
        `Scraping action failed with error: ${err.message.slice(0, 40)}`,
        {
          cause: err,
        }
      )
    );
  }
};

module.exports = {
  performScraping,
  scrapeSourcesListAsync,
};

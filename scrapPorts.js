const request = require("request");
const cheerio = require("cheerio");

async function scrap() {
  const url = "http://www.iana.org/assignments/service-names-port-numbers/service-names-port-numbers.xml";

  var customHeaderRequest = await request.defaults({
    headers: { "User-Agent": "neoss" },
  });

  var result = {};

  customHeaderRequest(url, function (error, response, html) {
    if (!error && response.statusCode == 200) {
      var $ = cheerio.load(html, {
        xmlMode: true,
      });
      $("registry > record").each((index, element) => {
        let port = $(element).find("number").text();
        let description = $(element).find("description").text();
        if (port.length > 0 && description != "Unassigned" && description != "" && description != "Reserved") {
          result[port] = description;
        }
      });
      console.log(result);
    }
  });

  console.log(result);
  console.log("FIN");
}

scrap();

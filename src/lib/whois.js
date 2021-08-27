const whoisJson = require("whois-json");

/**
 * Converts whois object to string.
 *
 * @param  {Object} data - Whois object
 * @return {string} - Result text
 */
function toString(data) {
  text = "";
  for (const key in data) {
    text += `${key}: ${data[key]}\n`;
  }
  return text;
}

/**
 * Performs a whois on given domain/IP
 *
 * @param  {string} domain - Domain/IP to be searched
 * @return {string} - Result text
 */
async function whois(domain) {
  var domainName = domain.split(".");

  if (domainName.some(isNaN)) {
    domainName = domainName.slice(-2).join(".");
  } else {
    domainName = domain;
  }

  var data = await whoisJson(domainName);
  // TODO: Parse result, catch errors / non existing domains
  return toString(data);
}

module.exports = { whois };

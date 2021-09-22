import whoisJson = require("whois-json");

/**
 * Converts whois object to string.
 *
 * @param  {Object} data - Whois object
 * @return {string} - Result text
 */
function toString(data: any) {
  var text: string = "";
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
export async function whois(domain: any) {
  // TODO: Parse reserved IP adresses
  var domainName = domain.split(".");

  if (domainName.some(isNaN)) {
    domainName = domainName.slice(-2).join(".");
  } else {
    domainName = domain;
  }

  var data = await whoisJson(domainName);
  data = toString(data);
  if (data.includes("no entries")) {
    return "No entries found.";
  }
  return data;
}

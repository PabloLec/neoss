// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const whoisJson = require("whois-json");

/**
 * Converts whois object to string.
 *
 * @param  {Object} data - Whois object
 * @return {string} - Result text
 */
function toString(data: any) {
  // @ts-expect-error ts-migrate(2552) FIXME: Cannot find name 'text'. Did you mean 'Text'?
  text = "";
  for (const key in data) {
    // @ts-expect-error ts-migrate(2552) FIXME: Cannot find name 'text'. Did you mean 'Text'?
    text += `${key}: ${data[key]}\n`;
  }
  // @ts-expect-error ts-migrate(2552) FIXME: Cannot find name 'text'. Did you mean 'Text'?
  return text;
}

/**
 * Performs a whois on given domain/IP
 *
 * @param  {string} domain - Domain/IP to be searched
 * @return {string} - Result text
 */
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'whois'.
async function whois(domain: any) {
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

// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = { whois };

const whoiser = require("whoiser");

/**
 * Perform a whois on given domain or IP.
 *
 * @param domain - Address to be considered
 * @returns - Formated text for popup content
 */
export async function whois(domain: any): Promise<string> {
  let domainName = domain.split(".");

  if (domainName.some(isNaN)) {
    domainName = domainName.slice(-2).join(".");
  } else {
    domainName = domain;
  }

  try {
    let data = await whoiser(domainName);
    let keys = Object.keys(data);
    if (keys.length === 0) {
      return "No entries found.";
    }

    if (keys.indexOf("range") != -1) {
      return toString(data);
    }
    return toString(whoiser.firstResult(data));
  } catch (e) {
    if (JSON.stringify(e) === "{}") {
      return "Private IP, check your neiborhood.\nhttps://en.wikipedia.org/wiki/Private_network";
    }
    return "Connection Refused";
  }
  return "Unexpected error";
}

/**
 * Format json key:value pairs to text for popup content.
 *
 * @param data - Raw whois object
 * @returns - Text to be displayed
 */
function toString(data: any): string {
  let text: string = "";
  for (const key in data) {
    text += `${key}: ${data[key]}\n`;
  }
  return text;
}

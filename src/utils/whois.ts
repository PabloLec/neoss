import whoisJson = require("whois-json");

/**
 * Perform a whois on given domain or IP.
 *
 * @param domain - Address to be considered
 * @returns - Formated text for popup content
 */
export async function whois(domain: any): Promise<string> {
  // TODO: Parse reserved IP adresses
  let domainName = domain.split(".");

  if (domainName.some(isNaN)) {
    domainName = domainName.slice(-2).join(".");
  } else {
    domainName = domain;
  }

  let data = await whoisJson(domainName);
  data = toString(data);
  if (data.includes("no entries")) {
    return "No entries found.";
  }
  return data;
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

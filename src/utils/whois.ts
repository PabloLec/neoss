import whoisJson = require("whois-json");

function toString(data: any) {
  let text: string = "";
  for (const key in data) {
    text += `${key}: ${data[key]}\n`;
  }
  return text;
}

export async function whois(domain: any) {
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

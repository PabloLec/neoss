import { readFileSync } from "fs";

var sockets = {};

/**
 * Drive async workflow for socket file descriptors acquisition.
 *
 * @returns - Sockets map {inode:statistics,}
 */
export async function getSockets(): Promise<{}> {
  let promises: Promise<void>[] = [];

  promises.push(readProcFile("tcp"));
  promises.push(readProcFile("udp"));
  promises.push(readProcFile("tcp6"));
  promises.push(readProcFile("udp6"));

  await Promise.all(promises);
  return sockets;
}

/**
 * Parse file content data for relevant socket statistics.
 *
 * @param data - Raw file text content
 * @param type - Transport protocol and version number
 */
function parseSockets(data: string, type: string) {
  let lines = data.split(/\r\n|\r|\n/);
  lines.shift();

  for (let line of lines) {
    if (!line) {
      continue;
    }
    let elements = line.trim().split(/\s+/);
    let inode = elements[9];

    sockets[inode] = {};
    sockets[inode].protocol = type.slice(0, 3);
    sockets[inode].state = formatState(elements[3]);
    [sockets[inode].receiveQueue, sockets[inode].sendQueue] = formatRxTx(elements[4]);

    if (type.includes("6")) {
      [sockets[inode].localAddress, sockets[inode].localPort] = formatIPv6(elements[1]);
      [sockets[inode].peerAddress, sockets[inode].peerPort] = formatIPv6(elements[2]);
    } else {
      [sockets[inode].localAddress, sockets[inode].localPort] = formatIPv4(elements[1]);
      [sockets[inode].peerAddress, sockets[inode].peerPort] = formatIPv4(elements[2]);
    }

    if (sockets[inode].localAddress == null || sockets[inode].peerAddress == null) {
      // Remove sockets with unkown addresses
      delete sockets[inode];
      continue;
    } else if (sockets[inode].localAddress == sockets[inode].peerAddress || sockets[inode].peerAddress == "localhost") {
      // Remove loopback sockets
      delete sockets[inode];
      continue;
    }

    sockets[inode].users = {};
    sockets[inode].inode = inode;
  }
}

/**
 * Format unix hex representation of IPv4 to its regular expression.
 *
 * @param line - Raw hex representation
 * @returns - Formated address
 */
function formatIPv4(line: string): (string | null)[] {
  let lineMap = line.split(":");
  let hexAddress = lineMap[0];
  let hexPort = lineMap[1];

  let hexArray = hexAddress
    .split(/(..)/g)
    .filter((s: any) => s)
    .map(hexToDecimal);
  hexArray.reverse();

  let address: string | null;
  if (parseInt(hexArray.join("")) == 0) {
    // Catch undefined addresses
    address = null;
  } else {
    address = hexArray.join(".");
  }
  let port = hexToDecimal(hexPort) + "";

  return [address, port];
}

/**
 * Format unix hex representation of IPv6 to its regular expression.
 *
 * @param line - Raw hex representation
 * @returns - Formated address
 */
function formatIPv6(line: string): (string | null)[] {
  let lineMap = line.split(":");
  let hexAddress = lineMap[0];
  let hexPort = lineMap[1];

  let hexArray = hexAddress.split(/(....)/g).filter((s: string) => s);
  hexArray.forEach(function (hex: string, i: number) {
    let splitHex = hex.split(/(..)/g).filter((s: any) => s);
    splitHex.reverse();
    hexArray[i] = splitHex.join("");
  });

  for (var i = 0; i < hexArray.length; i += 2) {
    [hexArray[i], hexArray[i + 1]] = [hexArray[i + 1], hexArray[i]];
  }

  let address: string | null;

  let sum = hexToDecimal(hexArray.join(""));
  if (sum == 0) {
    // Catch undefined addresses
    address = null;
  } else if (sum == 1) {
    // Shorten loopback address
    address = "::1";
  } else if (hexArray.slice(0, 6).join("") == "00000000000000000000FFFF") {
    // Catch IPv4 expressed in IPv6 notation
    let ipV4Part = hexArray[6] + hexArray[7];
    address = ipV4Part
      .split(/(..)/g)
      .filter((s: any) => s)
      .map(hexToDecimal)
      .join(".");
  } else {
    hexArray.forEach(function (hex: string, i: number) {
      // Notation shortening
      let hexInt = parseInt(hex, 16) + "";
      hexArray[i] = hexInt == "0000" ? "" : hexArray[i];
    });
    address = hexArray.join(":");
  }
  let port = hexToDecimal(hexPort) + "";

  return [address, port];
}

/**
 * Format receiveQueue and sendQueue hex representation to decimal.
 *
 * @param line - Raw hex representation
 * @returns - Decimal values
 */
function formatRxTx(line: string): string[] {
  let lineMap = line.split(":");
  let rx = hexToDecimal(lineMap[0]) + "";
  let tx = hexToDecimal(lineMap[1]) + "";

  return [rx, tx];
}

/**
 * Get a definition for socket state from hex value
 *
 * @param hex - Raw hex value
 * @returns - State definition
 */
function formatState(hex: string): string {
  let state = "";

  switch (hex) {
    case "01":
      state = "ESTAB";
      break;
    case "02":
      state = "SYN_SENT";
      break;
    case "03":
      state = "SYN_RECV";
      break;
    case "04":
      state = "FIN_WAIT1";
      break;
    case "05":
      state = "FIN_WAIT2";
      break;
    case "06":
      state = "TIME_WAIT";
      break;
    case "07":
      state = "CLOSED";
      break;
    case "08":
      state = "CLOSE_WAIT";
      break;
    case "09":
      state = "LAST_ACK";
      break;
    case "0A":
      state = "LISTEN";
      break;
    case "0B":
      state = "CLOSING";
      break;
    case "0C":
      state = "NEW_SYN_RECV";
      break;
  }

  return state;
}

/**
 * Read process file content and initiate its parsing.
 *
 * @param file - File name (process inode)
 */
async function readProcFile(file: string) {
  let content = readFileSync("/proc/net/" + file, "utf8");
  parseSockets(content, file);
}

/**
 * Convert a hex string representation to its decimal value.
 *
 * @param str - Hex string representation
 * @returns - Decimal value
 */
function hexToDecimal(str: string): number {
  return parseInt(Number("0x" + str) + "", 10);
}

const fs = require("fs");

var sockets = {};

async function getSockets() {
  var promises = [];

  promises.push(readProcFile("tcp"));
  promises.push(readProcFile("udp"));
  promises.push(readProcFile("tcp6"));
  promises.push(readProcFile("udp6"));

  await Promise.all(promises);
  return sockets;
}

async function readProcFile(file) {
  let content = fs.readFileSync("/proc/net/" + file, "utf8");
  parseSockets(content, file);
}

function parseSockets(data, type) {
  let lines = data.split(/\r\n|\r|\n/);
  lines.shift();

  for (var line of lines) {
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

function hexToDecimal(str) {
  return parseInt(Number("0x" + str), 10);
}

function formatIPv4(line) {
  line = line.split(":");
  let hexAddress = line[0];
  let hexPort = line[1];

  let hexArray = hexAddress
    .split(/(..)/g)
    .filter((s) => s)
    .map(hexToDecimal);
  hexArray.reverse();

  let address;
  if (parseInt(hexArray) == 0) {
    // Catch undefined addresses
    address = null;
  } else {
    address = hexArray.join(".");
  }
  let port = hexToDecimal(hexPort) + "";

  return [address, port];
}

function formatIPv6(line) {
  line = line.split(":");
  let hexAddress = line[0];
  let hexPort = line[1];

  let hexArray = hexAddress.split(/(....)/g).filter((s) => s);
  hexArray.forEach(function (hex, i) {
    hexArray[i] = hex.split(/(..)/g).filter((s) => s);
    hexArray[i].reverse();
    hexArray[i] = hexArray[i].join("");
  });

  for (var i = 0; i < hexArray.length; i += 2) {
    [hexArray[i], hexArray[i + 1]] = [hexArray[i + 1], hexArray[i]];
  }

  let address;

  let sum = hexToDecimal(hexArray.join(""));
  if (sum == 0) {
    // Catch undefined addresses
    address = null;
  } else if (sum == 1) {
    // Shorten loopback address
    address = "::1";
  } else if (hexArray.slice(0, 6).join("") == "00000000000000000000FFFF") {
    // Catch IPv4 expressed in IPv6 notation
    hexArray = hexArray[6] + hexArray[7];
    address = hexArray
      .split(/(..)/g)
      .filter((s) => s)
      .map(hexToDecimal)
      .join(".");
  } else {
    hexArray.forEach(function (hex, i) {
      // Notation shortening
      hex = parseInt(hex, 16);
      hexArray[i] = hex == "0000" ? "" : hexArray[i];
    });
    address = hexArray.join(":");
  }
  let port = hexToDecimal(hexPort) + "";

  return [address, port];
}

function formatRxTx(line) {
  line = line.split(":");
  let rx = hexToDecimal(line[0]) + "";
  let tx = hexToDecimal(line[1]) + "";

  return [rx, tx];
}

function formatState(hex) {
  let state;

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

module.exports = getSockets;

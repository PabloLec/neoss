const fs = require("fs");

var sockets = { tcp: {}, udp: {}, tcp6: {}, udp6: {} };

fs.readFile("/proc/net/tcp", "utf8", (err, data) => {
  if (err) throw err;
  //parseSockets(data, "tcp");
  //console.log(sockets);
});

fs.readFile("/proc/net/udp", "utf8", (err, data) => {
  if (err) throw err;
  //parseSockets(data, "udp");
  //console.log(sockets);
});

fs.readFile("/proc/net/tcp6", "utf8", (err, data) => {
  if (err) throw err;
  parseSockets(data, "tcp6");
  console.log(sockets);
});

fs.readFile("/proc/net/udp6", "utf8", (err, data) => {
  if (err) throw err;
  //parseSockets(data, "udp6");
  //console.log(sockets);
});

function hexToDecimal(str) {
  return parseInt(Number("0x" + str), 10);
}

function parseSockets(data, type) {
  let lines = data.split(/\r\n|\r|\n/);
  lines.shift();

  //console.log(lines);

  for (var line of lines) {
    if (!line) {
      continue;
    }
    let elements = line.trim().split(/\s+/);
    let inode = elements[9];
    sockets[type][inode] = {};
    if (type.includes("6")) {
      [sockets[type][inode].localAddress, sockets[type][inode].localPort] = formatIPv6(elements[1]);
      [sockets[type][inode].peerAddress, sockets[type][inode].peerPort] = formatIPv6(elements[2]);
    } else {
      [sockets[type][inode].localAddress, sockets[type][inode].localPort] = formatIPv4(elements[1]);
      [sockets[type][inode].peerAddress, sockets[type][inode].peerPort] = formatIPv4(elements[2]);
    }

    sockets[type][inode].state = formatState(elements[3]);
    [sockets[type][inode].sendQueue, sockets[type][inode].receiveQueue] = formatRxTx(elements[4]);
  }
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

  let localAddress = hexArray.join(".");
  let localPort = hexToDecimal(hexPort) + "";

  return [localAddress, localPort];
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

  let localAddress;

  let sum = hexToDecimal(hexArray.join(""));
  if (sum == 0) {
    localAddress = null;
  } else if (sum == 1) {
    // Shorten loopback address
    localAddress = "::1";
  } else if (hexArray.slice(0, 6).join("") == "00000000000000000000FFFF") {
    // Catch IPv4 expressed in IPv6 notation
    hexArray = hexArray[6] + hexArray[7];
    localAddress = hexArray
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
    localAddress = hexArray.join(":");
  }
  let localPort = hexToDecimal(hexPort) + "";

  return [localAddress, localPort];
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
      state = "ESTABLISHED";
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
      state = "CLOSE";
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

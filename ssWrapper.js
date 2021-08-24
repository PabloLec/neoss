const { spawn } = require("child_process");
const exec = require("child_process").exec;
const os = require("os");
const fs = require("fs");

var cmdOutput = "";

var connections = [];

const ss = (screen, table) => {
  let process = spawn("ss", ["-OHrtupn"]);
  process.stdout.on("data", (data) => {
    cmdOutput += data;
  });

  process.stderr.on("data", (data) => {
    console.log(`stderr: ${data}`);
  });

  process.on("error", (error) => {
    console.log(`error: ${error.message}`);
  });

  process.on("close", (code) => {
    formatOutput(cmdOutput);
    table.setData({
      headers: [
        "Protocol",
        "State",
        "Receive Queue",
        "Send Queue",
        "Local Address",
        "Local Port",
        "Peer Address",
        "Peer Port",
        "Users",
      ],
      data: connections,
      colWidth: [5, 5, 5, 5, 20, 10, 20, 10, 10, 10],
    });
    screen.render();
  });
};

function formatAddress(line) {
  var address;
  var port;
  if (line.match(/(\[::ffff)/)) {
    // Handle IPv4 addresses expressed in IPv6 notation.
    address = line.match("([0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3})")[1];
    port = line.match(":([0-9]+)$")[1];
  } else {
    address = line.match("([^:]+):")[1];
    port = line.match(":([0-9]+)")[1];
  }

  return [address.trim(), port.trim()];
}

function formatUsers(i, users) {
  connections[i].users = {};
  if (users) {
    usersList = users.match(/(\"[^\"]+\"\,pid=[0-9]+\,fd=[0-9]+)/g);

    for (let j = 0; j < usersList.length; j++) {
      connections[i].users[j] = {};
      connections[i].users[j].name = usersList[j].match('"([^"]+)"')[1];
      connections[i].users[j].pid = usersList[j].match("pid=([0-9]+)")[1];
      fs.readFile("/proc/" + connections[i].users[j].pid + "/cmdline", "UTF8", function (err, data) {
        if (err) {
          throw err;
        }
        data = data.split("\0").join(" ");
        connections[i].users[j].cmdline = data;
      });

      exec(
        "ps -o user= -p " + connections[i].users[j].pid,
        (err, stdout, stderr) => (connections[i].users[j].owner = stdout.trim())
      );
    }
    if (usersList.length == 1) {
      connections[i].users.text = connections[i].users[0].name;
    } else {
      connections[i].users.text = usersList.length + " users";
    }
  } else {
    connections[i].users.text = "/";
  }
}

function formatOutput(data) {
  let outputLines = data.split(os.EOL);
  for (let i = 0; i < outputLines.length; i++) {
    if (outputLines[i].includes("users")) {
      line = outputLines[i]
        .split("users:")[0]
        .split(" ")
        .filter((n) => n);

      users = outputLines[i].split("users:")[1];
    } else {
      line = outputLines[i].split(" ").filter((n) => n);
      users = null;
    }
    if (line.length == 0) {
      continue;
    }

    connections[i] = {};
    connections[i].protocol = line[0].trim();
    connections[i].state = line[1].trim();
    connections[i].receiveQueue = line[2].trim();
    connections[i].sendQueue = line[3].trim();
    [connections[i].localAddress, connections[i].localPort] = formatAddress(line[4]);
    [connections[i].peerAddress, connections[i].peerPort] = formatAddress(line[5]);

    formatUsers(i, users);
  }
}

module.exports = ss;

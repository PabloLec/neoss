var whoisJson = require("whois");

var blessed = require("neo-blessed");
var Table = require("./table");
const pino = require("pino");
const logger = pino(pino.destination("/tmp/node.log"));

const { spawn } = require("child_process");

const ls = spawn("ss", ["-OHrtupn"]);
var os = require("os");
var whoisJson = require("whois");

var cmdOutput = "";
var connections = [];

ls.stdout.on("data", (data) => {
  cmdOutput += data;
});

ls.stderr.on("data", (data) => {
  console.log(`stderr: ${data}`);
});

ls.on("error", (error) => {
  console.log(`error: ${error.message}`);
});

ls.on("close", (code) => {
  //console.log(`child process exited with code ${code}`);
  formatOutput(cmdOutput);
  table.setData({
    headers: ["protocol", "state", "received", "sent", "localAddress", "localPort", "peerAddress", "peerPort", "users"],
    data: connections,
    colWidth: [5, 5, 5, 5, 20, 10, 20, 10, 10, 10],
  });
  //console.log(connections);
  logger.info("Data loaded");
  screen.render();
});

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
    connections[i].protocol = line[0];
    connections[i].state = line[1];
    connections[i].received = line[2];
    connections[i].sent = line[3];
    connections[i].localAddress = line[4].match("([^:]+):")[1];
    connections[i].localPort = line[4].match(":([0-9]+)")[1];
    connections[i].peerAddress = line[5].match("([^:]+):")[1];

    connections[i].peerPort = line[5].match(":([0-9]+)")[1];

    if (users) {
      usersList = users.match(/(\"[^\"]+\"\,pid=[0-9]+\,fd=[0-9]+)/g);
      connections[i].users = {};
      for (let j = 0; j < usersList.length; j++) {
        connections[i].users[j] = {};
        connections[i].users[j].name = usersList[j].match('"([^"]+)"')[1];
        connections[i].users[j].pid = usersList[j].match("pid=([0-9]+)")[1];
      }
    } else {
      connections[i].users = null;
    }
    connections[i].users = "test";
  }
}

// Create a screen object.
var screen = blessed.screen({
  smartCSR: true,
});

screen.title = "my window title";

var table = Table({
  keys: true,
  interactive: true,
  scrollable: true,
  tags: true,
  top: "0",
  left: "center",
  width: "90%",
  height: "90%",
  data: [
    ["Animals", "Foods"],
    ["Elephant", "Apple"],
    ["Bird", "Orange"],
  ],
  border: {
    type: "line",
  },
  style: {
    fg: "white",
    bg: "magenta",
    border: {
      fg: "#f0f0f0",
    },
    hover: {
      bg: "green",
    },
  },
});

// Append our box to the screen.
screen.append(table);

// Quit on Escape, q, or Control-C.
screen.key(["escape", "q", "C-c"], function (ch, key) {
  return process.exit(0);
});

table.focus();

// Render the screen.
screen.render();

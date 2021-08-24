var blessed = require("neo-blessed");
var Table = require("./table");
const pino = require("pino");
const logger = pino(pino.destination("/tmp/node.log"));
const ss = require("./ssWrapper");

var screen = blessed.screen({
  smartCSR: true,
});

screen.title = "neoss";

var table = Table({
  keys: true,
  interactive: true,
  tags: true,
  top: "0",
  left: "center",
  width: "100%",
  height: "shrink",
  border: {
    type: "line",
  },
  style: {
    fg: "white",
    border: {
      fg: "white",
    },
    focus: {
      bg: "blue",
    },
    header: {
      fg: "black",
      bg: "white",
    },
  },
});

ss(screen, table);
screen.key(["escape", "q", "C-c"], function (ch, key) {
  return process.exit(0);
});

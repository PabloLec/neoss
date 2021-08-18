var blessed = require("neo-blessed");
var Table = require("./table");
const pino = require("pino");
const logger = pino(pino.destination("/tmp/node.log"));
const ss = require("./ssWrapper");

// Create a screen object.
var screen = blessed.screen({
  smartCSR: true,
});

screen.title = "my window title";

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
    bg: "magenta",
    border: {
      fg: "#f0f0f0",
    },
    hover: {
      bg: "green",
    },
  },
});

ss.ss(screen, table);

// Append our box to the screen.
screen.append(table);

// Quit on Escape, q, or Control-C.
screen.key(["escape", "q", "C-c"], function (ch, key) {
  return process.exit(0);
});

table.focus();

// Render the screen.
screen.render();

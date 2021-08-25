require("app-module-path").addPath(`${__dirname}/app`);
const blessed = require("neo-blessed");
const Table = require.main.require("src/ui/table");
const ss = require("src/lib/ssWrapper");

const screen = blessed.screen({
  smartCSR: true,
});

screen.title = "neoss";

const table = Table({
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

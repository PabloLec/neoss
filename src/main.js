#!/usr/bin/env node

const blessed = require("neo-blessed");
const Table = require.main.require("src/ui/table");
const getStats = require("src/lib/getStats");
const screen = blessed.screen({
  smartCSR: true,
});

screen.title = "neoss";
screen.key(["escape", "q", "C-c"], function (ch, key) {
  return process.exit(0);
});

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

getStats(screen, table);

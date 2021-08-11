var whoisJson = require("whois");

var blessed = require("blessed");
var contrib = require("blessed-contrib");
var matrix = require("./matrix");

// Create a screen object.
var screen = blessed.screen({
  smartCSR: true,
});

screen.title = "my window title";

var table = matrix({
  keys: true,
  fg: "white",
  selectedFg: "white",
  selectedBg: "green",
  interactive: true,
  label: "Active Processes",
  width: "30%",
  height: "30%",
  border: { type: "line", fg: "cyan" },
  columnSpacing: 10, //in chars
  columnWidth: [16, 12, 12] /*in chars*/,
});

//allow control the table with the keyboard
table.focus();

table.setData({
  headers: ["col1", "col2", "col3"],
  data: [
    [1, 2, 3],
    [4, 5, 8],
  ],
  colWidth: [33, 33, 33],
});

// Append our box to the screen.
screen.append(table);
// Focus our element.
table.focus();

// Quit on Escape, q, or Control-C.
screen.key(["escape", "q", "C-c"], function (ch, key) {
  return process.exit(0);
});

// Render the screen.
screen.render();

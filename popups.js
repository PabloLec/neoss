var blessed = require("neo-blessed"),
  Node = blessed.Node,
  Box = blessed.Box;

const pino = require("pino");
const logger = pino(pino.destination("/tmp/node.log"));
const fs = require("fs");

var strings = {};
var stringsNames = ["ports", "protocols", "queues", "states"];

stringsNames.forEach(function (name) {
  fs.readFile("strings/" + name + ".json", (err, data) => {
    if (err) throw err;
    strings[name] = JSON.parse(data);
  });
});

var currentBox = null;

function removePopup(screen) {
  if (currentBox != null) {
    screen.remove(currentBox);
    currentBox = null;
  }
  screen.render();
}

function createPopup(popup, screen) {
  currentBox = popup;
  currentBox.key(["enter", "escape"], function (ch, key) {
    removePopup(screen);
  });
  screen.append(currentBox);
  screen.render();
}

function handlePopup(screen, column, content) {
  if (currentBox != null) {
    screen.remove(currentBox);
    currentBox = null;
    screen.render();
    return;
  }

  content = content.trim();
  switch (column) {
    case 0:
      createPopup(textPopup(strings["protocols"][content]), screen);
      break;
    case 1:
      createPopup(textPopup(strings["states"][content]), screen);
      break;
    case 2:
      createPopup(textPopup(strings["queues"]["receiveQueue"]), screen);
      break;
    case 3:
      createPopup(textPopup(strings["queues"]["sendQueue"]), screen);
      break;
    case 4:
      break;
    case 5:
      createPopup(textPopup(strings["ports"][content]), screen);
      break;
    case 6:
      break;
    case 7:
      createPopup(textPopup(strings["ports"][content]), screen);
      break;
    case 8:
      break;
  }
}

function textPopup(content) {
  return blessed.box({
    top: "center",
    left: "center",
    width: "shrink",
    height: "shrink",
    content: content,
    tags: true,
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
}

module.exports = { handlePopup };

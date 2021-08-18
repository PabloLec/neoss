var blessed = require("neo-blessed"),
  Node = blessed.Node,
  Box = blessed.Box;

const pino = require("pino");
const logger = pino(pino.destination("/tmp/node.log"));
const fs = require("fs");
const whois = require("./whois");

var strings = {};
var stringsNames = ["ports", "protocols", "queues", "states"];
var screen;

stringsNames.forEach(function (name) {
  fs.readFile("strings/" + name + ".json", (err, data) => {
    if (err) throw err;
    strings[name] = JSON.parse(data);
  });
});

var currentBox = null;

function focusPopup() {
  if (currentBox != null) {
    currentBox.focus();
  }
}

function removePopup() {
  if (currentBox != null) {
    screen.remove(currentBox);
    currentBox = null;
    screen.rewindFocus();
    screen.render();
  }
}

function createPopup(popup, escapable = true) {
  currentBox = popup;
  if (escapable) {
    currentBox.key(["enter", "escape"], function (ch, key) {
      removePopup(screen);
    });
  }
  screen.append(currentBox);
  screen.render();
  currentBox.focus();
}

function handlePopup(mainScreen, column, content) {
  screen = mainScreen;

  switch (column) {
    case 0:
      createPopup(textPopup(strings["protocols"][content]));
      break;
    case 1:
      createPopup(textPopup(strings["states"][content]));
      break;
    case 2:
      createPopup(textPopup(strings["queues"]["receiveQueue"]));
      break;
    case 3:
      createPopup(textPopup(strings["queues"]["sendQueue"]));
      break;
    case 4:
      break;
    case 5:
      createPopup(textPopup(strings["ports"][content]));
      break;
    case 6:
      createPopup(textPopup("Wait for Whois..."), false);
      whois.whois(content).then(function (response) {
        removePopup(screen);
        createPopup(textPopup(response));
      });
      break;
    case 7:
      createPopup(textPopup(strings["ports"][content]));
      break;
    case 8:
      break;
  }
}

function canShrink(content) {
  let maxShrinkSize = Math.floor((Math.floor(screen.lines.length / 2) - 1) / 2);
  let numberOfLines = content.split(/\r\n|\r|\n/).length;
  if (numberOfLines < maxShrinkSize) {
    return true;
  } else {
    return false;
  }
}

function textPopup(content) {
  let height = "50%";
  let scrollable = true;
  if (canShrink(content)) {
    height = "shrink";
    scrollable = false;
  }

  return blessed.box({
    top: "center",
    left: "center",
    width: "shrink",
    height: height,
    scrollable: scrollable,
    alwaysScroll: true,
    keys: true,
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

module.exports = { handlePopup, focusPopup };
